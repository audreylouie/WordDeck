import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  useIonViewWillEnter 
} from '@ionic/react';
import './Tab2.css';

const Tab2: React.FC = () => {
  const [savedWords, setSavedWords] = useState<any[]>([]);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [quizData, setQuizData] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizResults, setQuizResults] = useState<boolean[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);

  const toggleCard = (index: number) => {
    setFlippedIndex(flippedIndex === index ? null : index);
  };

  const removeWord = (index: number) => {
    const updatedSavedWords = savedWords.filter((_, idx) => idx !== index);
    setSavedWords(updatedSavedWords);
    localStorage.setItem('savedWords', JSON.stringify(updatedSavedWords));
  };

  const saveDefinition = (wordToSave: string, selectedMeaning: any) => {
    const savedWords = JSON.parse(localStorage.getItem('savedWords') || '[]');
    const existingWordIndex = savedWords.findIndex((wordData: any) => wordData.word === wordToSave);

    if (existingWordIndex !== -1) {
      const existingWord = savedWords[existingWordIndex];
      const existingMeaningIndex = existingWord.definitions.findIndex(
        (meaning: any) => meaning.partOfSpeech === selectedMeaning.partOfSpeech
      );

      if (existingMeaningIndex !== -1) {
        const existingDefinitionIndex = existingWord.definitions[existingMeaningIndex].definitions.findIndex(
          (definition: any) => definition.definition === selectedMeaning.definitions[0].definition
        );

        if (existingDefinitionIndex === -1) {
          existingWord.definitions[existingMeaningIndex].definitions.push(selectedMeaning.definitions[0]);
        }
      } else {
        existingWord.definitions.push(selectedMeaning);
      }
    } else {
      const newWord = { word: wordToSave, definitions: [selectedMeaning] };
      savedWords.push(newWord);
    }

    localStorage.setItem('savedWords', JSON.stringify(savedWords));
  };

  useIonViewWillEnter(() => {
    // Perform asynchronous operations using promises inside this block
    const fetchData = () => {
      return new Promise((resolve, reject) => {
        try {
          const savedData = JSON.parse(localStorage.getItem('savedWords') || '[]');
          setSavedWords(savedData);
          resolve(savedData);
        } catch (error) {
          console.error('Error fetching data:', error);
          reject(error);
        }
      });
    };
  
    fetchData();
  });

  const startQuiz = () => {
    const quizContent = savedWords.map((wordData, index) => {
      return {
        word: wordData.word,
        definitions: wordData.definitions.map((def: any) => def.definitions[0].definition),
      };
    });

    const shuffledQuizContent = [...quizContent].sort(() => Math.random() - 0.5);

    setQuizData(shuffledQuizContent);
    setQuizAnswers(new Array(shuffledQuizContent.length).fill(''));
    setQuizResults(new Array(shuffledQuizContent.length).fill(false));
    setQuizMode(true);
    setShowResults(false);
  };

  const handleAnswerChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedAnswers = [...quizAnswers];
    updatedAnswers[index] = event.target.value;
    setQuizAnswers(updatedAnswers);
  };

  const submitQuiz = () => {
    const results = quizData.map((data, index) => {
      const isCorrect = data.word.toLowerCase() === quizAnswers[index].toLowerCase();
      if (!isCorrect) {
        setCorrectAnswers((prevCorrectAnswers) => [...prevCorrectAnswers, data.word]);
      }
      return isCorrect;
    });
    setQuizResults(results);
    setShowResults(true);
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('savedWords');
    setSavedWords([]);
  };

  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Your words</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="flashcards-container">
          <h2>Your Flashcards</h2>
          <IonButton onClick={clearLocalStorage}>Clear Data</IonButton>
          {savedWords.map((wordData, index) => (
            <IonCard key={index} onClick={() => toggleCard(index)}>
              <IonCardContent>
                {flippedIndex === index ? (
                  <>
                    {wordData.definitions.map((def: any, i: number) => (
                      <div key={i}>
                        <p>{def.partOfSpeech}</p>
                        <ul>
                          {def.definitions.map((definition: any, idx: number) => (
                            <li key={idx}>{definition.definition}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <IonButton onClick={() => removeWord(index)}>Remove</IonButton>
                  </>
                ) : (
                  <div className="card-front">
                    <IonCardHeader>
                      <IonCardTitle>{wordData.word}</IonCardTitle>
                    </IonCardHeader>
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          ))}
          <IonButton onClick={startQuiz}>Quiz Yourself</IonButton>
        </div>
        {quizMode && (
          <IonCard>
            <IonCardContent>
              <div className='quiz'>
              <h2>Quiz</h2>
              {quizData.map((data, index) => (
                <div key={index}>
                  <p>
                    {index + 1}: Definition - {data.definitions}
                  </p>
                  <input
                    type="text"
                    value={quizAnswers[index]}
                    onChange={(event) => handleAnswerChange(index, event)}
                  />
                </div>
              ))}
              <IonButton onClick={submitQuiz}>Check Answer</IonButton>
              {showResults && (
                <div>
                  <h3>Results</h3>
                  <ul>
                    {quizResults.map((result, index) => (
                      <li key={index}>
                        {index + 1}: {result ? 'Correct' : `Wrong. Correct answer: ${correctAnswers[index]}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              </div>
            </IonCardContent>
          </IonCard>
        )}
        
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
