export function validateStudentInput(name, email, age) {
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push("Name is required");
  }

  if (!email || email.trim().length === 0) {
    errors.push("Email is required");
  }

  if (age === undefined || age === null) {
    errors.push("Age is required");
  } else if (!Number.isInteger(Number(age))) {
    errors.push("Age must be an integer");
  }

  return errors;
}
