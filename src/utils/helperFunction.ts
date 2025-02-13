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
    const isNameEmpty = String(item.name).trim();
    const isQuantityEmpty = String(item.quantity).trim();
    const isApproxamount = +item.approxAmount >= 0;
    // If one of the fields is empty, show notification and exit
    if (!isNameEmpty || !isQuantityEmpty || !isApproxamount) {
      return false; // This ensures we skip processing further
    } else {
      return true; // This ensures we skip processing further
    }
  });
  return itemsArray;
};

export { filteredMissingFieldsObjectFromItems, numberToWords };
