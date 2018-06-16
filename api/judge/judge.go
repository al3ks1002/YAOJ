package judge

import (
	"bytes"
	"errors"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"sync"

	linuxproc "github.com/c9s/goprocinfo/linux"
)

/*
#include <unistd.h>
*/
import "C"

type Judge struct {
}

var (
	CLOCKS_PER_SEC int64
)

func init() {
	CLOCKS_PER_SEC = int64(C.sysconf(C._SC_CLK_TCK))
}

func (judge *Judge) WriteContentToFile(filePath string, fileContent string) error {
	// if it exists, delete it
	if _, err := os.Stat(filePath); err == nil {
		err = os.Remove(filePath)
		if err != nil {
			return err
		}
	}

	// create and open
	var file, err = os.OpenFile(filePath, os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.WriteString(fileContent)
	if err != nil {
		return err
	}

	err = file.Sync()
	if err != nil {
		return err
	}
	return nil
}

func (judge *Judge) Compile(sourcePath string, binaryPath string) error {
	cmd := exec.Command("g++", "--std=c++14", "-O2", "-o", binaryPath, sourcePath)
	stdoutStderr, err := cmd.CombinedOutput()
	if err != nil {
		return errors.New(fmt.Sprintf("%s err:%s", stdoutStderr, err))
	}
	return nil
}

// Returns cpuTime, runningTime, error, isDone
func (judge *Judge) GetTime(pid int) (int64, int64, error, bool) {
	processStat, err := linuxproc.ReadProcessStat("/proc/" + strconv.Itoa(pid) + "/stat")
	if err != nil {
		if os.IsNotExist(err) || strings.Contains(err.Error(), "no such process") {
			return 0, 0, nil, true
		} else {
			return 0, 0, err, true
		}
	}

	upTime, err := linuxproc.ReadUptime("/proc/uptime")
	if err != nil {
		return 0, 0, err, true
	}

	cpuTime := int64(float64(processStat.Utime+processStat.Stime) * 1000 / float64(CLOCKS_PER_SEC))
	runningTime := int64(upTime.Total*1000) - int64(processStat.Starttime)*1000/CLOCKS_PER_SEC

	return cpuTime, runningTime, nil, false
}

func (judge *Judge) TransformNoSpaces(input []byte) []byte {
	mlc := bytes.Map(func(r rune) rune {
		if r == '\t' || r == '\n' || r == ' ' || r == '\r' {
			return -1
		}
		return r
	}, input)
	return mlc
}

func (judge *Judge) Equal(output []byte, ok []byte) bool {
	outputNoSpaces := judge.TransformNoSpaces(output)
	okNoSpaces := judge.TransformNoSpaces(ok)
	return bytes.Equal(outputNoSpaces, okNoSpaces)
}

func max(a, b int64) int64 {
	if a < b {
		return b
	}
	return a
}

func (judge *Judge) Run(binaryPath string, timelimit int64, inTestContent string, okTestContent string) (string, error) {
	// Prepare running command
	cmd := exec.Command(binaryPath)
	cmd.Stdin = strings.NewReader(inTestContent)
	outputBuffer := new(bytes.Buffer)
	cmd.Stdout = outputBuffer

	// Run
	err := cmd.Start()
	if err != nil {
		return "Server error", err
	}
	defer cmd.Process.Kill()

	var runtimeError error = nil
	var waitGroup sync.WaitGroup
	go func() {
		waitGroup.Add(1)
		defer waitGroup.Done()
		err := cmd.Wait()
		if err != nil {
			runtimeError = err
		}
	}()

	var processTime int64 = 0
	for {
		currentCpuTime, currentRunningTime, err, isDone := judge.GetTime(cmd.Process.Pid)
		if err != nil {
			return "Server error", err
		}
		if isDone {
			break
		}
		currentTime := max(currentRunningTime, currentCpuTime)
		if currentTime > timelimit {
			return "Time limit exceeded", nil
		}
		processTime = max(processTime, currentTime)
	}
	log.Println(processTime)

	waitGroup.Wait()
	if runtimeError != nil {
		return "Runtime error", nil
	}

	if !judge.Equal(outputBuffer.Bytes(), []byte(okTestContent)) {
		return "Wrong answer", nil
	}

	return "Accepted", nil
}
