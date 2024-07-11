const validAge = (birthdate) => {
  const [day, month, year] = birthdate.split(".");
  const birthday = new Date(year, month - 1, day);

  const today = new Date();

  let age = today.getFullYear() - birthday.getFullYear();

  if (today.getMonth() < birthday.getMonth()) {
    age--;
  } else if (
    today.getMonth() === birthday.getMonth() &&
    today.getDate() < birthday.getDate()
  ) {
    age--;
  }

  return age >= 18;
};

module.exports = validAge;
