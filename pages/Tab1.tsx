import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonAlert, IonSearchbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import './Tab1.css';

const Tab1: React.FC = () => {
  const [word, setWord] = useState('');
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [wordNotFound, setWordNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showSavedAlert, setShowSavedAlert] = useState(false);

  const saveDefinition = (wordToSave: string, selectedMeaning: any) => {
    const savedWords = JSON.parse(localStorage.getItem('savedWords') || '[]');
    const existingWord = savedWords.find((wordData: any) => wordData.word === wordToSave);

    if (existingWord) {
      const existingMeaning = existingWord.definitions.find((meaning: any) => meaning.partOfSpeech === selectedMeaning.partOfSpeech);
      
      if (existingMeaning) {
        const existingDefinition = existingMeaning.definitions.find((definition: any) => definition.definition === selectedMeaning.definitions[0].definition);
        
        if (!existingDefinition) {
          existingMeaning.definitions.push(selectedMeaning.definitions[0]);
        }
      } else {
        existingWord.definitions.push(selectedMeaning);
      }
    } else {
      const newWord = { word: wordToSave, definitions: [selectedMeaning] };
      savedWords.push(newWord);
    }

    localStorage.setItem('savedWords', JSON.stringify(savedWords));
    setShowSavedAlert(true);
  };

  const searchWord = async () => {
    try {
      setSearching(true);
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await response.json();
      if (data.title && data.title === 'No Definitions Found') {
        setWordNotFound(true);
        setDefinitions([]);
      } else {
        const filteredDefinitions = data.map((entry: any) => {
          return {
            word: entry.word,
            meanings: entry.meanings.filter((meaning: any) => meaning.partOfSpeech !== 'punctuation'),
          };
        });
        setDefinitions(filteredDefinitions);
        setWordNotFound(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Search Definition</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonSearchbar value={word} onIonChange={(e) => setWord(e.detail.value!)} placeholder="Enter a word"></IonSearchbar>
        <div className="search-container">
          <IonButton onClick={searchWord} disabled={searching}>Search</IonButton>
        </div>
        <div className="definitions-container">
          {definitions.map((entry, index) => (
            <IonCard key={index}>
              <IonCardHeader>
                <IonCardTitle>{entry.word}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {entry.meanings.map((meaning: any, idx: number) => (
                  meaning.partOfSpeech !== 'punctuation' && (
                    <div key={idx}>
                      <h3>{meaning.partOfSpeech}</h3>
                      <ul>
                        {meaning.definitions.map((def: any, i: number) => (
                          <li key={i}>
                            {def.definition}
                            {def.example && <p>Example: {def.example}</p>}
                            <IonButton size="small" onClick={() => saveDefinition(entry.word, meaning)}>
                              Save Definition
                            </IonButton>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                ))}
              </IonCardContent>
            </IonCard>
          ))}
        </div>
        <IonAlert
          isOpen={wordNotFound}
          onDidDismiss={() => setWordNotFound(false)}
          header={'Word Not Found'}
          message={`The word "${word}" does not exist in the dictionary.`}
          buttons={['OK']}
        />
        <IonAlert
          isOpen={showSavedAlert}
          onDidDismiss={() => setShowSavedAlert(false)}
          header={'Definition Saved'}
          message={`The definition for "${word}" has been saved.`}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;