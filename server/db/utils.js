const prettifyUnexpectedError = (err) => {
  if (err) {
    console.log(err);
  } else {
    err = "";
  }
  return { error: "An internal error occurred.", details: err, code: 500 };
};

module.exports = {
    prettifyUnexpectedError
}