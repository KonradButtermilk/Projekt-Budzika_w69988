import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import Colors from '@/constants/colors';
import { generateMathChallenge } from '@/utils/mathChallengeUtils';

interface MathChallengeProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onSolved: () => void;
}

/**
 * Komponent wyzwania matematycznego.
 * Generuje zadanie matematyczne, które użytkownik musi rozwiązać, aby wyłączyć alarm.
 */
export default function MathChallenge({ difficulty, onSolved }: MathChallengeProps) {
  const [challenge, setChallenge] = useState(generateMathChallenge(difficulty));
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Generuje nowe wyzwanie, gdy zmienia się poziom trudności
  useEffect(() => {
    setChallenge(generateMathChallenge(difficulty));
    setAnswer('');
    setError(false);
    setAttempts(0);
  }, [difficulty]);

  // Obsługuje wysłanie odpowiedzi
  const handleSubmit = () => {
    Keyboard.dismiss(); // Ukryj klawiaturę
    
    const userAnswer = parseInt(answer, 10);
    
    if (isNaN(userAnswer)) {
      setError(true);
      return;
    }
    
    // Sprawdź, czy odpowiedź jest poprawna
    if (userAnswer === challenge.answer) {
      onSolved(); // Wywołaj callback, jeśli odpowiedź jest poprawna
    } else {
      setError(true);
      setAttempts(prev => prev + 1);
      
      // Po 3 nieudanych próbach, zresetuj licznik prób, ale zachowaj to samo zadanie
      if (attempts >= 2) {
        setAnswer('');
        setAttempts(0);
      }
    }
  };

  // Umożliwia wysłanie odpowiedzi klawiszem Enter
  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solve to dismiss alarm</Text>
      
      <View style={styles.challengeContainer}>
        <Text style={styles.question}>{challenge.question} = ?</Text>
        
        <TextInput
          style={[styles.input, error && styles.inputError]} // Zmień styl, jeśli odpowiedź jest błędna
          value={answer}
          onChangeText={(text) => {
            setAnswer(text);
            setError(false); // Zresetuj błąd po rozpoczęciu pisania
          }}
          onKeyPress={handleKeyPress}
          placeholder="Enter your answer"
          keyboardType="number-pad" // Klawiatura numeryczna
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          testID="math-challenge-input"
          autoFocus // Automatycznie ustaw fokus na polu tekstowym
        />
        
        {error && (
          <Text style={styles.errorText}>
            Incorrect answer. {3 - attempts} {attempts === 2 ? 'attempt' : 'attempts'} left.
          </Text>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        testID="math-challenge-submit"
      >
        <Text style={styles.submitButtonText}>Check Answer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    color: Colors.light.text,
  },
  challengeContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  question: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
    color: Colors.light.text,
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 2,
    borderColor: Colors.light.gray[300],
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 20,
    backgroundColor: Colors.light.gray[100],
    textAlign: 'center',
  },
  inputError: {
    borderColor: Colors.light.danger, // Czerwona ramka dla błędu
  },
  errorText: {
    color: Colors.light.danger,
    marginTop: 12,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
