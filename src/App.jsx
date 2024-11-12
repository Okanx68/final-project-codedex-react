import {useEffect, useState} from 'react'
import './App.css'
import Results from "./components/Results.jsx";
import Question from "./components/Question.jsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Header from "./components/Header.jsx";
import {UserProvider} from "./components/UserContext.jsx";
import UserForm from "./components/UserForm.jsx";

const questions = [
    {
        question: "What's your favorite color?",
        options: ["Red 🔴", "Blue 🔵", "Green 🟢", "Yellow 🟡"],
    },
];

const keywords = {
    Fire: "fire",
    Water: "water",
    Earth: "earth",
    Air: "air",
};

const elements = {
    "Red 🔴": "Fire",
    "Blue 🔵": "Water",
    "Green 🟢": "Earth",
    "Yellow 🟡": "Air",
    // Continue mapping all your possible options to a keyword
};

function App() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [userName, setUserName] = useState('');
    const [element, setElement] = useState('');
    const [artwork, setArtwork] = useState(null);

    function handleAnswer(answer) {
        setAnswers([...answers, answer]);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
    };

    function handleUserFormSubmit(name) {
        setUserName(name);
    };

    function determineElement(answers) {
        const counts = {};
        answers.forEach(function(answer) {
            const element = elements[answer];
            counts[element] = (counts[element] || 0) + 1;
        });
        return Object.keys(counts).reduce(function(a, b) {
            return counts[a] > counts[b] ? a : b
        });
    };


    useEffect(() => {
        function fetchArtwork(keyword) {
            const apiEndpoint = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${keyword}`;

            fetch(apiEndpoint)
                .then(response => response.json())
                .then(data => {
                    if (data.total > 0) {
                        const randomIndex = Math.floor(Math.random() * data.objectIDs.length);
                        const objectId = data.objectIDs[randomIndex];
                        fetchArtworkDetails(objectId);
                    }
                })
                .catch(error => {
                    console.error('Error fetching artwork:', error);
                });
        }

        function fetchArtworkDetails(objectId) {
            const detailsEndpoint = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`;

            fetch(detailsEndpoint)
                .then(response => response.json())
                .then(data => {
                    console.log('Artwork details:', data);

                    setArtwork({
                        title: data.title,
                        primaryImage: data.primaryImage && data.primaryImage !== '' ? data.primaryImage : 'https://picsum.photos/200/300',
                        artistDisplayName: data.artistDisplayName || 'Unknown Artist',
                        objectDate: data.objectDate || 'Unknown Date',
                    });
                })
                .catch(error => {
                    console.error('Error fetching artwork details:', error);
                });
        }

        if (currentQuestionIndex === questions.length) {
            const selectedElement = determineElement(answers);
            setElement(selectedElement);
            fetchArtwork(keywords[selectedElement]);
        }
    }, [currentQuestionIndex, answers]);

    return (
        <UserProvider value={{ name: userName, setName: setUserName }}>
            <BrowserRouter>
                <Header />
                <Routes>
                    <Route path="/" element={<UserForm onSubmit={handleUserFormSubmit} />} />
                    <Route
                        path="/quiz"
                        element={
                            currentQuestionIndex < questions.length ? (
                                <Question
                                    question={questions[currentQuestionIndex].question}
                                    options={questions[currentQuestionIndex].options}
                                    onAnswer={handleAnswer}
                                />
                            ) : (
                                <Results element={element} artwork={artwork} />
                            )
                        }
                    />
                </Routes>
            </BrowserRouter>
        </UserProvider>
    );
}

export default App
