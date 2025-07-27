type Operator = '+' | '-' | '*';

/**
 * Interfejs definiujący strukturę wyzwania matematycznego.
 */
interface MathChallenge {
  question: string; // Pytanie matematyczne (np. "5 + 3")
  answer: number;    // Poprawna odpowiedź
}

/**
 * Generuje losową liczbę całkowitą z podanego zakresu (włącznie).
 * @param min - Minimalna wartość.
 * @param max - Maksymalna wartość.
 * @returns Losowa liczba całkowita.
 */
const generateRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generuje proste wyzwanie matematyczne (dodawanie/odejmowanie).
 * @returns Obiekt MathChallenge.
 */
const generateSimpleChallenge = (): MathChallenge => {
  const num1 = generateRandomNumber(1, 10);
  const num2 = generateRandomNumber(1, 10);
  const operators: Operator[] = ['+', '-'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let answer: number;
  if (operator === '+') {
    answer = num1 + num2;
  } else {
    // Zapewnia, że odejmowanie nie daje wyników ujemnych
    const [larger, smaller] = num1 >= num2 ? [num1, num2] : [num2, num1];
    answer = larger - smaller;
    return {
      question: `${larger} ${operator} ${smaller}`,
      answer
    };
  }
  
  return {
    question: `${num1} ${operator} ${num2}`,
    answer
  };
};

/**
 * Generuje średnio trudne wyzwanie matematyczne (dodawanie/odejmowanie/mnożenie).
 * @returns Obiekt MathChallenge.
 */
const generateMediumChallenge = (): MathChallenge => {
  const num1 = generateRandomNumber(5, 20);
  const num2 = generateRandomNumber(5, 15);
  const operators: Operator[] = ['+', '-', '*'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let answer: number;
  if (operator === '+') {
    answer = num1 + num2;
  } else if (operator === '-') {
    const [larger, smaller] = num1 >= num2 ? [num1, num2] : [num2, num1];
    answer = larger - smaller;
    return {
      question: `${larger} ${operator} ${smaller}`,
      answer
    };
  } else {
    // Dla mnożenia użyj mniejszych liczb
    const smallNum1 = generateRandomNumber(2, 8);
    const smallNum2 = generateRandomNumber(2, 8);
    answer = smallNum1 * smallNum2;
    return {
      question: `${smallNum1} ${operator} ${smallNum2}`,
      answer
    };
  }
  
  return {
    question: `${num1} ${operator} ${num2}`,
    answer
  };
};

/**
 * Generuje trudne wyzwanie matematyczne (dwuetapowe operacje lub dzielenie).
 * @returns Obiekt MathChallenge.
 */
const generateHardChallenge = (): MathChallenge => {
  const challengeType = Math.floor(Math.random() * 3);
  
  if (challengeType === 0) {
    // Dwuetapowe dodawanie/odejmowanie
    const num1 = generateRandomNumber(10, 30);
    const num2 = generateRandomNumber(5, 20);
    const num3 = generateRandomNumber(5, 15);
    const op1 = Math.random() < 0.5 ? '+' : '-';
    const op2 = Math.random() < 0.5 ? '+' : '-';
    
    let intermediate: number;
    if (op1 === '+') {
      intermediate = num1 + num2;
    } else {
      intermediate = Math.max(num1, num2) - Math.min(num1, num2);
    }
    
    let final: number;
    if (op2 === '+') {
      final = intermediate + num3;
    } else {
      final = Math.max(intermediate, num3) - Math.min(intermediate, num3);
    }
    
    return {
      question: `${Math.max(num1, num2)} ${op1} ${Math.min(num1, num2)} ${op2} ${num3}`,
      answer: final
    };
  } else if (challengeType === 1) {
    // Mnożenie z dodawaniem/odejmowaniem
    const num1 = generateRandomNumber(3, 9);
    const num2 = generateRandomNumber(3, 9);
    const num3 = generateRandomNumber(5, 20);
    const op = Math.random() < 0.5 ? '+' : '-';
    
    const product = num1 * num2;
    let answer: number;
    if (op === '+') {
      answer = product + num3;
    } else {
      answer = Math.max(product, num3) - Math.min(product, num3);
    }
    
    return {
      question: `${num1} * ${num2} ${op} ${num3}`,
      answer
    };
  } else {
    // Proste dzielenie (zawsze daje liczby całkowite)
    const divisor = generateRandomNumber(2, 8);
    const quotient = generateRandomNumber(3, 12);
    const dividend = divisor * quotient;
    
    return {
      question: `${dividend} ÷ ${divisor}`,
      answer: quotient
    };
  }
};

/**
 * Główna funkcja do generowania wyzwania matematycznego na podstawie poziomu trudności.
 * @param difficulty - Poziom trudności ('easy', 'medium', 'hard').
 * @returns Obiekt MathChallenge zawierający pytanie i odpowiedź.
 */
export const generateMathChallenge = (difficulty: 'easy' | 'medium' | 'hard'): MathChallenge => {
  switch (difficulty) {
    case 'easy':
      return generateSimpleChallenge();
    case 'medium':
      return generateMediumChallenge();
    case 'hard':
      return generateHardChallenge();
    default:
      return generateSimpleChallenge();
  }
};
