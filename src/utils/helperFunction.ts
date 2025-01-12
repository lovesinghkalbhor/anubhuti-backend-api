function numberToWords(num: number): string {
  if (num === 0) return "zero";

  const belowTwenty = [
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const thousands = ["", "thousand", "million", "billion"];

  let word = "";
  let i = 0;

  function helper(n: number): string {
    if (n === 0) return "";
    else if (n < 20) return belowTwenty[n - 1] + " ";
    else if (n < 100) return tens[Math.floor(n / 10)] + " " + helper(n % 10);
    else
      return (
        belowTwenty[Math.floor(n / 100) - 1] + " hundred " + helper(n % 100)
      );
  }

  while (num > 0) {
    if (num % 1000 !== 0) {
      word = helper(num % 1000) + thousands[i] + " " + word;
    }
    num = Math.floor(num / 1000);
    i++;
  }

  return word.trim();
}

const filteredMissingFieldsObjectFromItems = (items: any[]) => {
  const itemsArray = items.filter((item) => {
    const isNameEmpty = !item.name || String(item.name).trim() === "";
    const isQuantityEmpty =
      !item.quantity || String(item.quantity).trim() === "";

    // If one of the fields is empty, show notification and exit
    if (isNameEmpty !== isQuantityEmpty) {
      return false; // This ensures we skip processing further
    } else if (isNameEmpty == true && isQuantityEmpty == true) {
      return false; // This ensures we skip processing further
    }
    return true;
  });
  return itemsArray;
};

export { filteredMissingFieldsObjectFromItems, numberToWords };
