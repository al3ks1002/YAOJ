package view

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/auth0-community/auth0"
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
	s.Handle("/contests", PublicContestsHandler(&view)).Methods("GET")
	s.Handle("/contests/{user-id}", authMiddleware(UserContestsHandler(&view))).Methods("GET")
	s.Handle("/new-contest", authMiddleware(NewContestHandler(&view))).Methods("POST")
	s.Handle("/contest/{contest-id}", ContestHandler(&view)).Methods("GET")
	s.Handle("/problems/{contest-id}", ProblemsHandler(&view)).Methods("GET")
	s.Handle("/new-problem/{contest-id}", authMiddleware(NewProblemHandler(&view))).Methods("POST")
	s.Handle("/problem/{problem-id}", ProblemHandler(&view)).Methods("GET")

	headersOk := handlers.AllowedHeaders([]string{"X-Requested-With", "Authorization", "X-Auth-Key", "X-Auth-Secret", "Content-Type"})
	originsOk := handlers.AllowedOrigins([]string{"*"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})
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

		token, err := validator.ValidateRequest(r)

		if err != nil {
			log.Println(err)
			log.Println("Token is not valid:", token)
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("Unauthorized"))
		} else {
			next.ServeHTTP(w, r)
		}
	})
}

var NotImplemented = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Not Implemented"))
})

var StatusHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("API is up and running"))
})

func LoginHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		dec := json.NewDecoder(r.Body)
		var user model.User
		if err := dec.Decode(&user); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			if err := view.Controller.HandleLogin(&user); err != nil {
				log.Println(err)
				http.Error(w, err.Error(), 500)
			}
		}
	})
}

func PublicContestsHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		if contests, err := view.Controller.GetPublicContests(); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			payload, _ := json.Marshal(contests)
			w.Write([]byte(payload))
		}
	})
}

func UserContestsHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		vars := mux.Vars(r)
		userId := vars["user-id"]

		if contests, err := view.Controller.GetUserContests(userId); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			payload, _ := json.Marshal(contests)
			w.Write([]byte(payload))
		}
	})
}

func NewContestHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		dec := json.NewDecoder(r.Body)
		var contest model.Contest

		if err := dec.Decode(&contest); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			if err := view.Controller.AddNewContest(&contest); err != nil {
				log.Println(err)
				http.Error(w, err.Error(), 500)
			}
		}
	})
}

func ContestHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		userId := r.URL.Query().Get("userId")
		vars := mux.Vars(r)
		contestId := vars["contest-id"]

		if !view.Controller.IsPublic(contestId) && !view.Controller.IsMyContest(userId, contestId) {
			err := "Not an owner of the contest"
			log.Println(err)
			http.Error(w, err, 403)
			return
		}

		if contest, err := view.Controller.GetContestWithId(contestId); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			payload, _ := json.Marshal(contest)
			w.Write([]byte(payload))
		}
	})
}

func ProblemsHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		userId := r.URL.Query().Get("userId")
		vars := mux.Vars(r)
		contestId := vars["contest-id"]

		if !view.Controller.IsPublic(contestId) && !view.Controller.IsMyContest(userId, contestId) {
			err := "Not an owner of the contest"
			log.Println(err)
			http.Error(w, err, 403)
		} else {
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

func NewProblemHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		dec := json.NewDecoder(r.Body)
		var requestInterface interface{}

		if err := dec.Decode(&requestInterface); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
			return
		}

		requestMap, ok := requestInterface.(map[string]interface{})
		if !ok {
			err := "Could not convert request to map"
			log.Println(err)
			http.Error(w, err, 500)
			return
		}

		userId, ok := requestMap["userId"].(string)
		if !ok {
			err := "Could not find userId in request"
			log.Println(err)
			http.Error(w, err, 500)
			return
		}

		vars := mux.Vars(r)
		contestId := vars["contest-id"]
		if !view.Controller.IsMyContest(userId, contestId) {
			err := "Not an owner of the contest"
			log.Println(err)
			http.Error(w, err, 403)
			return
		}

		problemName, ok := requestMap["name"].(string)
		if !ok {
			err := "Could not find name in request"
			log.Println(err)
			http.Error(w, err, 500)
			return
		}

		problemDescription, ok := requestMap["description"].(string)
		if !ok {
			err := "Could not find description in request"
			log.Println(err)
			http.Error(w, err, 500)
			return
		}

		problem := model.Problem{ContestId: contestId, Name: problemName, Description: problemDescription}
		if err := view.Controller.AddNewProblem(&problem); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		}
	})
}

func ProblemHandler(view *View) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		vars := mux.Vars(r)
		problemId := vars["problem-id"]

		if problem, err := view.Controller.GetProblemWithId(problemId); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			userId := r.URL.Query().Get("userId")
			contestId := problem.ContestId

			if !view.Controller.IsPublic(contestId) && !view.Controller.IsMyContest(userId, contestId) {
				err := "Not an owner of the problem"
				log.Println(err)
				http.Error(w, err, 403)
				return
			}

			payload, _ := json.Marshal(problem)
			w.Write([]byte(payload))
		}
	})
}
