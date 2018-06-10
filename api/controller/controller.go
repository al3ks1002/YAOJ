package controller

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"mime/multipart"
	"net/http"

	"../model"
	"../repository"
)

type Controller struct {
	Repository repository.Repository
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

func (ctrl *Controller) SeaweedPostTest(testName string, testContent string, fId string) (*http.Response, error) {
	body := new(bytes.Buffer)
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", testName)
	if err != nil {
		return nil, err
	}
	part.Write([]byte(testContent))

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

func (ctrl *Controller) AddTestInStorage(problemId string, fId string, testName string) error {
	return ctrl.Repository.AddTest(problemId, fId, testName)
}

func (ctrl *Controller) GetTestsForProblem(problemId string, terminationString string) ([]model.Test, error) {
	return ctrl.Repository.GetTestsForProblem(problemId, terminationString)
}

func (ctrl *Controller) GetTestWithId(fId string) (*model.Test, error) {
	return ctrl.Repository.GetTestWithId(fId)
}

func (ctrl *Controller) DeleteTestWithId(fId string) error {
	return ctrl.Repository.DeleteTestWithId(fId)
}
