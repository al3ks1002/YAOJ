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
		if contests, err := view.Controller.GetUserContests(vars["user-id"]); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			payload, _ := json.Marshal(contests)
			w.Write([]byte(payload))
		}
	})
}

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
		vars := mux.Vars(r)
		if contest, err := view.Controller.GetContestWithId(vars["contest-id"]); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
		} else {
			payload, _ := json.Marshal(contest)
			w.Write([]byte(payload))
		}
	})
}
