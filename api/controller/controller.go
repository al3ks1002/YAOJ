package controller

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"strings"
	"time"

	"../judge"
	"../model"
	"../repository"
)

type Controller struct {
	Repository repository.Repository
	Judge      judge.Judge
}

func (ctrl *Controller) GetPublicContests() ([]model.Contest, error) {
	return ctrl.Repository.GetPublicContests()
}

func (ctrl *Controller) GetUserContests(userId string) ([]model.Contest, error) {
	return ctrl.Repository.GetUserContests(userId)
}

func (ctrl *Controller) HandleLogin(user *model.User) error {
	return ctrl.Repository.HandleLogin(user)
}

func (ctrl *Controller) AddNewContest(contest *model.Contest) error {
	return ctrl.Repository.AddNewContest(contest)
}

func (ctrl *Controller) GetContestWithId(contestId string) (*model.Contest, error) {
	return ctrl.Repository.GetContestWithId(contestId)
}

func (ctrl *Controller) GetProblemsFromContest(contestId string) ([]model.Problem, error) {
	return ctrl.Repository.GetProblemsFromContest(contestId)
}

func (ctrl *Controller) AddNewProblem(problem *model.Problem) error {
	return ctrl.Repository.AddNewProblem(problem)
}

func (ctrl *Controller) GetProblemWithId(problemId string) (*model.Problem, error) {
	return ctrl.Repository.GetProblemWithId(problemId)
}

func (ctrl *Controller) DeleteContestWithId(contestId string) error {
	return ctrl.Repository.DeleteContestWithId(contestId)
}

func (ctrl *Controller) DeleteProblemWithId(problemId string) error {
	return ctrl.Repository.DeleteProblemWithId(problemId)
}

func (ctrl *Controller) UpdateContest(contest *model.Contest) error {
	return ctrl.Repository.UpdateContest(contest)
}

func (ctrl *Controller) UpdateProblem(problem *model.Problem) error {
	return ctrl.Repository.UpdateProblem(problem)
}

func (ctrl *Controller) IsPublic(contestId string) bool {
	if contest, err := ctrl.GetContestWithId(contestId); err != nil {
		return false
	} else {
		return contest.IsPublic
	}
}

func (ctrl *Controller) IsMyContest(userId string, contestId string) bool {
	if contest, err := ctrl.GetContestWithId(contestId); err != nil {
		return false
	} else {
		return contest.OwnerId == userId
	}
}

const SeaweedMaster string = "http://localhost:9333/"
const SeaweedVolume string = "http://localhost:8081/"

func (ctrl *Controller) GetSeaweedId() (string, error) {
	response, err := http.Get(SeaweedMaster + "dir/assign")
	if err != nil {
		return "", err
	}

	defer response.Body.Close()
	contents, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return "", err
	}

	var jsonMap map[string]interface{}
	json.Unmarshal([]byte(string(contents)), &jsonMap)

	fId, ok := jsonMap["fid"].(string)
	if !ok {
		return "", err
	}

	return fId, nil
}

func (ctrl *Controller) SeaweedPost(fileName string, fileContent string, fId string) (*http.Response, error) {
	body := new(bytes.Buffer)
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", fileName)
	if err != nil {
		return nil, err
	}
	part.Write([]byte(fileContent))

	err = writer.Close()
	if err != nil {
		return nil, err
	}

	seaweedRequest, err := http.NewRequest("POST", SeaweedVolume+fId, body)
	seaweedRequest.Header.Add("Content-Type", writer.FormDataContentType())
	if err != nil {
		return nil, err
	}

	client := &http.Client{}
	return client.Do(seaweedRequest)
}

func (ctrl *Controller) SeaweedDelete(fId string) (*http.Response, error) {
	seaweedRequest, err := http.NewRequest("DELETE", SeaweedVolume+fId, nil)
	if err != nil {
		return nil, err
	}

	client := &http.Client{}
	return client.Do(seaweedRequest)
}

func (ctrl *Controller) AddFileInStorage(problemId string, fId string, fileName string) error {
	return ctrl.Repository.AddFile(problemId, fId, fileName)
}

func (ctrl *Controller) GetFilesForProblem(problemId string, terminationString string) ([]model.File, error) {
	return ctrl.Repository.GetFilesForProblem(problemId, terminationString)
}

func (ctrl *Controller) GetFileWithId(fId string) (*model.File, error) {
	return ctrl.Repository.GetFileWithId(fId)
}

func (ctrl *Controller) DeleteFileWithId(fId string) error {
	return ctrl.Repository.DeleteFileWithId(fId)
}

func (ctrl *Controller) AddSubmissionToStorage(userId string, problemId string, fId string) (string, error) {
	return ctrl.Repository.AddSubmission(&model.Submission{UserId: userId, ProblemId: problemId, FId: fId, Status: "In queue", Timestamp: time.Now()})
}

func (ctrl *Controller) GetContentFromFId(fId string) (string, error) {
	resp, err := http.Get(SeaweedVolume + fId)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	fileContent, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	return string(fileContent), nil
}

func (ctrl *Controller) RunSubmission(submissionId string, fId string, problemId string) error {
	// Get the source content from Seaweed
	sourceContent, err := ctrl.GetContentFromFId(fId)
	if err != nil {
		return err
	}

	// Prepare the source
	sourcePath := "/tmp/" + submissionId + ".cpp"
	binaryPath := "/tmp/" + submissionId + ".bin"
	err = ctrl.Judge.WriteContentToFile(sourcePath, sourceContent)
	if err != nil {
		return err
	}

	// Update submission status to 'Compiling'
	err = ctrl.Repository.UpdateSubmissionStatus(submissionId, "Compiling")
	if err != nil {
		return err
	}

	// Compile
	err = ctrl.Judge.Compile(sourcePath, binaryPath)
	if err != nil {
		// Update submission status to 'Compilation error'
		err = ctrl.Repository.UpdateSubmissionStatus(submissionId, "Compilation eror")
		if err != nil {
			return err
		}
		return nil
	}

	// Get the timelimit
	timelimit, err := ctrl.Repository.GetTimelimit(problemId)
	if err != nil {
		return err
	}

	// Prepare the tests
	inTests, err := ctrl.Repository.GetFilesForProblem(problemId, "in")
	if err != nil {
		return err
	}
	inTestsMap := map[string]string{}
	for _, inTest := range inTests {
		inTestsMap[strings.TrimSuffix(inTest.FileName, ".in")] = inTest.FId
	}
	okTests, err := ctrl.Repository.GetFilesForProblem(problemId, "ok")
	if err != nil {
		return err
	}
	okTestsMap := map[string]string{}
	for _, okTest := range okTests {
		okTestsMap[strings.TrimSuffix(okTest.FileName, ".ok")] = okTest.FId
	}

	// Run the source code on every test
	numOkTests := 0
	numTotalTests := 0
	for testName := range inTestsMap {
		inTestFId := inTestsMap[testName]
		okTestFId, ok := okTestsMap[testName]
		// If there is no ok for the in test, continue
		if !ok {
			continue
		}

		// Get test contents
		inTestContent, err := ctrl.GetContentFromFId(inTestFId)
		if err != nil {
			return err
		}
		okTestContent, err := ctrl.GetContentFromFId(okTestFId)
		if err != nil {
			return err
		}

		// Update submission status to 'Running on test'
		err = ctrl.Repository.UpdateSubmissionStatus(submissionId, "Running on "+testName+".in")
		if err != nil {
			return err
		}

		log.Println("Running on " + testName + ".in")
		// Run
		status, processTime, err := ctrl.Judge.Run(binaryPath, timelimit, inTestContent, okTestContent)
		if err != nil {
			// Update submission status and return if an error occured
			err = ctrl.Repository.UpdateSubmissionStatus(submissionId, status)
			if err != nil {
				return err
			}
			return nil
		}

		log.Println(testName + ": " + status)
		if status == "Accepted" {
			numOkTests++
		}
		numTotalTests++
		err = ctrl.Repository.AddNewResult(submissionId, testName, status, processTime)
		if err != nil {
			return err
		}
	}

	// Update submission status
	err = ctrl.Repository.UpdateSubmissionStatus(submissionId, "Done")
	if err != nil {
		return err
	}

	// Update score
	if numTotalTests == 0 {
		numTotalTests = 1
	}
	err = ctrl.Repository.UpdateSubmissionScore(submissionId, float64(numOkTests)/float64(numTotalTests)*100)
	if err != nil {
		return err
	}

	return nil
}

func (ctrl *Controller) GetSubmissionsForProblem(problemId string) ([]model.Submission, error) {
	return ctrl.Repository.GetSubmissionsForProblem(problemId)
}

func (ctrl *Controller) GetSubmissionWithId(submissionId string) (*model.Submission, error) {
	return ctrl.Repository.GetSubmissionWithId(submissionId)
}

func (ctrl *Controller) GetResultsForSubmission(submissionId string) ([]model.Result, error) {
	return ctrl.Repository.GetResultsForSubmission(submissionId)
}
