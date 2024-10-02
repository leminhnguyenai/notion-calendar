export default function StringToNum(str) {
  let uniqueNumber = 0;
  const baseLetters = 26; // 26 letters in the alphabet
  const baseNumbers = 10; // 10 digits (0-9)
  const A_CHAR_CODE = "A".charCodeAt(0) - 1;

  str = str.toUpperCase();

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (/[A-Z]/.test(char)) {
      // Convert alphabet characters
      const charCode = char.charCodeAt(0) - A_CHAR_CODE;
      uniqueNumber = uniqueNumber * baseLetters + charCode;
    } else if (/[0-9]/.test(char)) {
      // Convert number characters
      const numCode = parseInt(char);
      uniqueNumber = uniqueNumber * baseNumbers + numCode;
    }
  }

  return uniqueNumber;
}
