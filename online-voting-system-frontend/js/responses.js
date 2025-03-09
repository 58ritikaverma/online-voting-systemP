function getBotResponse(input) {
  return match(input.toLowerCase(), config);
}

const config = {
  hello: "Hello there!",
  goodbye: "Talk to you later!",
  "how can i register myself?":
    "Go to Register page ,enter the valid credentials/entries which are asked and then submit the form. Please ensure all the credentials/entries must be correct which are further approved by admin.",
  "how do i find my profile?":
    "Go to the Dashboard page, Your profile will be displayed on the left section of the page.",
  "How do I find the candidate details?":
    "Go to the Dashboard page via login, the list of all the candidates is shown along with the photo,name and party symbol of the candidate in the middle section of the dashboard page.",
  "how can i vote successfully?":
    "Go to login page, enter your aadhar number and password then moved to main Voting Dashboard page where the list of all candidates are displayed with respective details and voting button within each of them along with the profile of users/yours. Only you can cast your vote to atmost one candidate by just pressing votting button respectively.",
  "how do i find my voting status?":
    "Go to the Dashboard page via login, Your Profile will be displayed on the left section of the dashboard page along with the status of the voter which is either not Voted or Voted.",
  "how can voter login into the system?":
    "Go to the Sign In Page Where User can Login by entering his/her Aadhar number and password which is generated during registeration process.",
  "how can voter logout into the system?":
    "Go to the Dashboard Page, After successfully casting of votes by user/voter shown in the profile of the voter, the voter can logout by just pressing the logout button which is on the right-top most position.",
};

// Match the Question Answer
function match(input, obj) {
  for (let key in obj) {
    let status = key.match(input.toLowerCase());
    if (status) {
      return obj[key] || "Try asking something else!";
    }
  }

  let inputArr = input.toLowerCase().split(" ");
  let previousLength = 0;
  let result = "";
  for (let key in obj) {
    let keyArr = key.toLocaleLowerCase().split(" ");
    intersection = inputArr.filter((item) => keyArr.includes(item));
    if (intersection.length > previousLength) {
      previousLength = intersection.length;
      result = obj[key];
    }
  }
  if (previousLength > 0) {
    return result;
  } else {
    return "Try asking something else!";
  }
}
