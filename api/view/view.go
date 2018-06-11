package view

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/auth0-community/auth0"
	"github.com/gorilla/context"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	jose "gopkg.in/square/go-jose.v2"

	"../controller"
	"../model"
)

type View struct {
	Port       string
	Controller *controller.Controller
}

func (view View) Start() {
	log.Printf("Starting, HTTP on: %s\n", view.Port)

	r := mux.NewRouter()

	s := r.PathPrefix("/api").Subrouter()

	s.Handle("/", StatusHandler).Methods("GET")
	s.Handle("/login", authMiddleware(LoginHandler(&view))).Methods("POST")

	s.Handle("/contests", authMiddleware(PublicContestsHandler(&view))).Methods("GET")
	s.Handle("/contests/{user-id}", authMiddleware(UserContestsHandler(&view))).Methods("GET")
	s.Handle("/contest/{contest-id}", authMiddleware(ContestHandler(&view))).Methods("GET")
	s.Handle("/problems/{contest-id}", authMiddleware(ProblemsHandler(&view))).Methods("GET")
	s.Handle("/problem/{problem-id}", authMiddleware(ProblemHandler(&view))).Methods("GET")
	s.Handle("/submissions/{problem-id}", authMiddleware(SubmissionsHandler(&view))).Methods("GET")

	s.Handle("/new-contest", authMiddleware(NewContestHandler(&view))).Methods("POST")
	s.Handle("/new-problem/{contest-id}", authMiddleware(NewProblemHandler(&view))).Methods("POST")

	s.Handle("/delete-contest/{contest-id}", authMiddleware(DeleteContestHandler(&view))).Methods("DELETE")
	s.Handle("/delete-problem/{problem-id}", authMiddleware(DeleteProblemHandler(&view))).Methods("DELETE")

	s.Handle("/update-contest/{contest-id}", authMiddleware(UpdateContestHandler(&view))).Methods("POST")
	s.Handle("/update-problem/{problem-id}", authMiddleware(UpdateProblemHandler(&view))).Methods("POST")

	s.Handle("/upload-files/{problem-id}", authMiddleware(UploadFilesHandler(&view))).Methods("POST")

	s.Handle("/in-tests/{problem-id}", authMiddleware(FilesHandler(&view, "in"))).Methods("GET")
	s.Handle("/ok-tests/{problem-id}", authMiddleware(FilesHandler(&view, "ok"))).Methods("GET")
	s.Handle("/sources/{problem-id}", authMiddleware(FilesHandler(&view, "cpp"))).Methods("GET")

	s.Handle("/delete-file/{f-id}", authMiddleware(DeleteFileHandler(&view))).Methods("DELETE")

	s.Handle("/execute/{f-id}", authMiddleware(ExecuteHandler(&view))).Methods("POST")

	headersOk := handlers.AllowedHeaders([]string{"X-Requested-With", "Authorization", "X-Auth-Key", "X-Auth-Secret", "Content-Type"})
	originsOk := handlers.AllowedOrigins([]string{"*"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"})
	handler := handlers.LoggingHandler(os.Stdout, handlers.CORS(headersOk, originsOk, methodsOk)(r))

	http.ListenAndServe(fmt.Sprintf(":%s", view.Port), handler)
}

const ApiClientSecret string = "wBFPMoaFta4jWJLooXtkuuareC728R9X"
const Auth0ApiAudience string = "mlc"
const Auth0Domain string = "https://mlcmlcmlx.eu.auth0.com/"

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		secret := []byte(ApiClientSecret)
		secretProvider := auth0.NewKeyProvider(secret)
		audience := []string{Auth0ApiAudience}

		configuration := auth0.NewConfiguration(secretProvider, audience, Auth0Domain, jose.HS256)
		validator := auth0.NewValidator(configuration, nil)

		// Get the access token
		token, err := validator.ValidateRequest(r)

		if err != nil {
			log.Println(err)
			log.Println("Token is not valid:", token)
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("Unauthorized"))
			return
		}

		// Get the claims of the access token (which contain details about the user)
		claims := map[string]interface{}{}
		err = validator.Claims(r, token, &claims)
		if err != nil {
			log.Println(err)
			log.Println("Could not get the token claims for token:", token)
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("Unauthorized"))
			return
		}

		// Get the userId that sent the request
		context.Set(r, "senderId", claims["sub"])
		next.ServeHTTP(w, r)
	})
}

var NotImplemented = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Not Implemented"))
})

var StatusHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("API is up and running"))
})

// Adds a User in the storage (overwrite if the user already exists)
func LoginHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		dec := json.NewDecoder(r.Body)
		var user model.User

		// Decode the user
		if err := dec.Decode(&user); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			// Get the sender ID from the request
			senderId := context.Get(r, "senderId").(string)

			// Get the user ID from the request
			userId := user.Id

			// Check if the sender is the same as the user
			if userId != senderId {
				err := "Sender is not the same as the user in request"
				log.Println(err)
				http.Error(w, err, 403)
				return
			}

			// Add the user to the storage
			if err := view.Controller.HandleLogin(&user); err != nil {
				log.Println(err)
				http.Error(w, err.Error(), 500)
			}
		}
	})
}

// Gets the public Contests
func PublicContestsHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Get the contests from the storage
		if contests, err := view.Controller.GetPublicContests(); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			payload, _ := json.Marshal(contests)
			w.Write([]byte(payload))
		}
	})
}

// Gets the Contests for a User given a user ID
func UserContestsHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Get the user ID from the URI
		vars := mux.Vars(r)
		userId := vars["user-id"]

		// Get the sender ID from the request
		senderId := context.Get(r, "senderId").(string)

		// Check if the sender is the same as the user
		if senderId != userId {
			err := "Sender is not the same as the user in request"
			log.Println(err)
			http.Error(w, err, 403)
			return
		}

		// Get the contests from the storage
		if contests, err := view.Controller.GetUserContests(userId); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			payload, _ := json.Marshal(contests)
			w.Write([]byte(payload))
		}
	})
}

// Adds a new Contest to the storage
func NewContestHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		dec := json.NewDecoder(r.Body)
		var contest model.Contest

		// Decode the contest from the request
		if err := dec.Decode(&contest); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			// Get the sender ID from the request
			senderId := context.Get(r, "senderId").(string)

			// Check if the sender is the same as the owner
			if senderId != contest.OwnerId {
				err := "Sender is not the same as the owner of the contest from the request"
				log.Println(err)
				http.Error(w, err, 403)
				return
			}

			// Add the new contest to the storage
			if err := view.Controller.AddNewContest(&contest); err != nil {
				log.Println(err)
				http.Error(w, err.Error(), 500)
			}
		}
	})
}

// Gets a Contest JSON given a contest ID
func ContestHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Get the contest ID from the URI
		vars := mux.Vars(r)
		contestId := vars["contest-id"]

		// Get the sender ID from the request
		senderId := context.Get(r, "senderId").(string)

		// Verify if the contest is public or if the sender is the owner of the contest
		if !view.Controller.IsPublic(contestId) && !view.Controller.IsMyContest(senderId, contestId) {
			err := "Not an owner of the contest"
			log.Println(err)
			http.Error(w, err, 403)
			return
		}

		// Get the contest from the storage
		if contest, err := view.Controller.GetContestWithId(contestId); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			payload, _ := json.Marshal(contest)
			w.Write([]byte(payload))
		}
	})
}

// Gets a list of Problems for a given contest
func ProblemsHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Get the contest ID from the URI
		vars := mux.Vars(r)
		contestId := vars["contest-id"]

		// Get the sender ID from the request
		senderId := context.Get(r, "senderId").(string)

		// Verify if the contest is public or if the sender is the owner of the contest
		if !view.Controller.IsPublic(contestId) && !view.Controller.IsMyContest(senderId, contestId) {
			err := "Not an owner of the contest"
			log.Println(err)
			http.Error(w, err, 403)
		} else {
			// Get the problems from the storage
			if problems, err := view.Controller.GetProblemsFromContest(contestId); err != nil {
				log.Println(err)
				http.Error(w, err.Error(), 500)
			} else {
				payload, _ := json.Marshal(problems)
				w.Write([]byte(payload))
			}
		}
	})
}

// Adds a new Problem to the storage
func NewProblemHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		dec := json.NewDecoder(r.Body)
		var requestInterface interface{}

		// Decode the request in the interface
		if err := dec.Decode(&requestInterface); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
			return
		}

		// Convert the interface to a map
		requestMap, ok := requestInterface.(map[string]interface{})
		if !ok {
			err := "Could not convert request to map"
			log.Println(err)
			http.Error(w, err, 500)
			return
		}

		// Get the user ID from the request
		userId, ok := requestMap["userId"].(string)
		if !ok {
			err := "Could not find userId in request"
			log.Println(err)
			http.Error(w, err, 500)
			return
		}

		// Get the sender ID from the request
		senderId := context.Get(r, "senderId").(string)

		if senderId != userId {
			err := "Sender is not the same as the user from the request"
			log.Println(err)
			http.Error(w, err, 404)
			return
		}

		// Get the contest ID from the URI
		vars := mux.Vars(r)
		contestId := vars["contest-id"]

		// Check if the user is allowed to add new problems for the contest
		if !view.Controller.IsMyContest(userId, contestId) {
			err := "Not an owner of the contest"
			log.Println(err)
			http.Error(w, err, 403)
			return
		}

		// Get the problem name from the request
		problemName, ok := requestMap["name"].(string)
		if !ok {
			err := "Could not find name in request"
			log.Println(err)
			http.Error(w, err, 500)
			return
		}

		// Get the problem description from the request
		problemDescription, ok := requestMap["description"].(string)
		if !ok {
			err := "Could not find description in request"
			log.Println(err)
			http.Error(w, err, 500)
			return
		}

		// Build the Problem struct and persist the change in the storage
		problem := model.Problem{ContestId: contestId, Name: problemName, Description: problemDescription}
		if err := view.Controller.AddNewProblem(&problem); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		}
	})
}

// Returns a Problem JSON given a problem ID
func ProblemHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Get the problem ID from the URI
		vars := mux.Vars(r)
		problemId := vars["problem-id"]

		// Get the problem from the storage
		if problem, err := view.Controller.GetProblemWithId(problemId); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			// Get the sender ID from the request
			senderId := context.Get(r, "senderId").(string)

			// Get the contest ID from the problem
			contestId := problem.ContestId

			// Check if owner of the problem
			if !view.Controller.IsPublic(contestId) && !view.Controller.IsMyContest(senderId, contestId) {
				err := "Not an owner of the problem"
				log.Println(err)
				http.Error(w, err, 403)
				return
			}

			// Respond with the problem
			payload, _ := json.Marshal(problem)
			w.Write([]byte(payload))
		}
	})
}

// Deletes a Contest given a contest ID
func DeleteContestHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Get the contest ID from the URI
		vars := mux.Vars(r)
		contestId := vars["contest-id"]

		// Get the sender ID from the request
		senderId := context.Get(r, "senderId").(string)

		// Verify if the sender is the owner of the contest
		if !view.Controller.IsMyContest(senderId, contestId) {
			err := "Not an owner of the contest"
			log.Println(err)
			http.Error(w, err, 403)
			return
		}

		// Delete the contest from the storage
		if err := view.Controller.DeleteContestWithId(contestId); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		}
	})
}

// Deletes a Problem given a problem ID
func DeleteProblemHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Get the problem ID from the URI
		vars := mux.Vars(r)
		problemId := vars["problem-id"]

		// Get the problem from the storage
		if problem, err := view.Controller.GetProblemWithId(problemId); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			// Get the sender ID from the request
			senderId := context.Get(r, "senderId").(string)

			// Get the contest ID from the problem
			contestId := problem.ContestId

			// Verify if the sender is the owner of the problem
			if !view.Controller.IsMyContest(senderId, contestId) {
				err := "Not an owner of the problem"
				log.Println(err)
				http.Error(w, err, 403)
				return
			}

			// Delete the problem from the storage
			if err := view.Controller.DeleteProblemWithId(problemId); err != nil {
				log.Println(err)
				http.Error(w, err.Error(), 500)
			}
		}
	})
}

// Updates a Contest in the storage
func UpdateContestHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		dec := json.NewDecoder(r.Body)
		var contest model.Contest

		// Get the contest ID from the URI
		vars := mux.Vars(r)
		contestId := vars["contest-id"]

		// Decode the contest from the request
		if err := dec.Decode(&contest); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			// Get the sender ID from the request
			senderId := context.Get(r, "senderId").(string)

			// Check if the sender is the same as the owner
			if senderId != contest.OwnerId {
				err := "Sender is not the same as the owner of the contest from the request"
				log.Println(err)
				http.Error(w, err, 403)
				return
			}

			contest.Id = contestId

			// Add the new contest to the storage
			if err := view.Controller.UpdateContest(&contest); err != nil {
				log.Println(err)
				http.Error(w, err.Error(), 500)
			}
		}
	})
}

// Updates a Problem in the storage
func UpdateProblemHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		dec := json.NewDecoder(r.Body)
		var problem model.Problem

		// Get the problem ID from the URI
		vars := mux.Vars(r)
		problemId := vars["problem-id"]

		// Decode the problem from the request
		if err := dec.Decode(&problem); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
			return
		}

		problem.Id = problemId

		// Get the current problem from the storage
		currentProblem, err := view.Controller.GetProblemWithId(problemId)
		if err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
			return
		}

		// Get the contest from the storage
		contest, err := view.Controller.GetContestWithId(currentProblem.ContestId)
		if err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
			return
		}

		// Get the sender ID from the request
		senderId := context.Get(r, "senderId").(string)

		// Check if the sender is the same as the owner
		if senderId != contest.OwnerId {
			err := "Sender is not the same as the owner of the contest from the request"
			log.Println(err)
			http.Error(w, err, 403)
			return
		}

		// Update the problem in the storage
		if err := view.Controller.UpdateProblem(&problem); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		}
	})
}

// Uploads files for a specific Problem
func UploadFilesHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := r.ParseMultipartForm((1 << 20) * 100); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		}

		// Go through all the uploaded files
		for k, v := range r.Form {
			fileName := k
			fileContent := string(v[0])

			// Get a Seaweed file ID
			fId, err := view.Controller.GetSeaweedId()
			if err != nil {
				log.Println(err)
				http.Error(w, err.Error(), 500)
				return
			}

			// Do a POST request to Seaweed to save the file in the filesyste2
			seaweedResponse, err := view.Controller.SeaweedPost(fileName, fileContent, fId)
			if err != nil {
				log.Println(err)
				http.Error(w, err.Error(), 500)
				return
			}

			// Check the Seaweed response code
			if seaweedResponse.StatusCode < 200 || seaweedResponse.StatusCode > 299 {
				err := "Seaweed POST error"
				log.Println(err)
				http.Error(w, err, seaweedResponse.StatusCode)
				return
			}

			// Get the problem ID from the URI
			vars := mux.Vars(r)
			problemId := vars["problem-id"]

			// Add the file in the storage
			err = view.Controller.AddFileInStorage(problemId, fId, fileName)
			if err != nil {
				log.Println(err)
				http.Error(w, err.Error(), 500)
				return
			}
		}
	})
}

// Returns a list of files for given a problem ID
func FilesHandler(view *View, terminationString string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Get the problem ID from the URI
		vars := mux.Vars(r)
		problemId := vars["problem-id"]

		// Get the problem from the storage
		if problem, err := view.Controller.GetProblemWithId(problemId); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			// Get the sender ID from the request
			senderId := context.Get(r, "senderId").(string)

			// Get the contest ID from the problem
			contestId := problem.ContestId

			// Check if owner of the problem
			if !view.Controller.IsMyContest(senderId, contestId) {
				err := "Not an owner of the problem"
				log.Println(err)
				http.Error(w, err, 403)
				return
			}

			// Get the files from the storage
			if files, err := view.Controller.GetFilesForProblem(problemId, terminationString); err != nil {
				log.Println(err)
				http.Error(w, err.Error(), 500)
			} else {
				payload, _ := json.Marshal(files)
				w.Write([]byte(payload))
			}
		}
	})
}

// Deletes a file given a file ID
func DeleteFileHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Get the file ID from the URI
		vars := mux.Vars(r)
		fId := vars["f-id"]

		// Get the file from the storage
		if file, err := view.Controller.GetFileWithId(fId); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			problemId := file.ProblemId

			// Get the problem from the storage
			if problem, err := view.Controller.GetProblemWithId(problemId); err != nil {
				log.Println(err)
				http.Error(w, err.Error(), 500)
			} else {
				// Get the sender ID from the request
				senderId := context.Get(r, "senderId").(string)

				// Get the contest ID from the problem
				contestId := problem.ContestId

				// Verify if the sender is the owner of the problem
				if !view.Controller.IsMyContest(senderId, contestId) {
					err := "Not an owner of the problem"
					log.Println(err)
					http.Error(w, err, 403)
					return
				}

				// Delete the problem from the storage
				if err := view.Controller.DeleteFileWithId(fId); err != nil {
					log.Println(err)
					http.Error(w, err.Error(), 500)
				}

				// Do a DELETE request to Seaweed to delete the file from the filesystem
				seaweedResponse, err := view.Controller.SeaweedDelete(fId)
				if err != nil {
					log.Println(err)
					http.Error(w, err.Error(), 500)
					return
				}

				// Check the Seaweed response code
				if seaweedResponse.StatusCode < 200 || seaweedResponse.StatusCode > 299 {
					err := "Seaweed DELETE error"
					log.Println(err)
					http.Error(w, err, seaweedResponse.StatusCode)
					return
				}
			}
		}
	})
}

// Execute a source given with a file id
func ExecuteHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Get the file ID from the URI
		vars := mux.Vars(r)
		fId := vars["f-id"]

		// Get the file from the storage
		if file, err := view.Controller.GetFileWithId(fId); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			problemId := file.ProblemId

			// Get the problem from the storage
			if problem, err := view.Controller.GetProblemWithId(problemId); err != nil {
				log.Println(err)
				http.Error(w, err.Error(), 500)
			} else {
				// Get the sender ID from the request
				senderId := context.Get(r, "senderId").(string)

				// Get the contest ID from the problem
				contestId := problem.ContestId

				// Verify if the sender is the owner of the problem
				if !view.Controller.IsPublic(contestId) && !view.Controller.IsMyContest(senderId, contestId) {
					err := "Not an owner of the problem"
					log.Println(err)
					http.Error(w, err, 403)
					return
				}

				// Add the submission in the storage
				if err := view.Controller.AddSubmissionToStorage(senderId, problemId, fId); err != nil {
					log.Println(err)
					http.Error(w, err.Error(), 500)
				}

				// Run the submission
				if err := view.Controller.RunSubmission(fId); err != nil {
					log.Println(err)
					http.Error(w, err.Error(), 500)
				}
			}
		}
	})
}

// Gets a list of Submissions for a given problem
func SubmissionsHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Get the problem ID from the URI
		vars := mux.Vars(r)
		problemId := vars["problem-id"]

		// Get the problem from the storage
		if problem, err := view.Controller.GetProblemWithId(problemId); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			// Get the sender ID from the request
			senderId := context.Get(r, "senderId").(string)

			// Get the contest ID from the problem
			contestId := problem.ContestId

			// Verify if the contest is public or if the sender is the owner of the contest
			if !view.Controller.IsPublic(contestId) && !view.Controller.IsMyContest(senderId, contestId) {
				err := "Not an owner of the contest"
				log.Println(err)
				http.Error(w, err, 403)
			} else {
				// Get the submissions from the storage
				if submissions, err := view.Controller.GetSubmissionsForProblem(problemId); err != nil {
					log.Println(err)
					http.Error(w, err.Error(), 500)
				} else {
					payload, _ := json.Marshal(submissions)
					w.Write([]byte(payload))
				}
			}
		}
	})
}
