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
)

type Config struct {
	Port string
}

func Start(viewConfig Config) {
	log.Printf("Starting, HTTP on: %s\n", viewConfig.Port)

	r := mux.NewRouter()

	// On the default page we will simply serve our static index page.
	r.Handle("/", http.FileServer(http.Dir("./webapp/")))
	// We will setup our server so we can serve static assest like images, css from the /static/{file} route
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static/"))))

	r.Handle("/status", StatusHandler).Methods("GET")
	r.Handle("/contests", authMiddleware(ContestHandler)).Methods("GET")

	http.ListenAndServe(fmt.Sprintf(":%s", viewConfig.Port), handlers.LoggingHandler(os.Stdout, r))
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
			fmt.Println(err)
			fmt.Println("Token is not valid:", token)
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

type Contest struct {
	Id   int
	Name string
}

var contests = []Contest{
	Contest{Id: 1, Name: "a"},
	Contest{Id: 2, Name: "b"},
}

var ContestHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	payload, _ := json.Marshal(contests)

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(payload))
})
