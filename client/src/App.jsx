import React, {useEffect, useState} from "react";

export default function () {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState([]);

  function handleFormChange(e) {
    setFormData({...formData, [e.target.name]: e.target.value});
  }

  async function getStudents() {
    try {
      const response = await fetch("http://localhost:3307/students");

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      setStudents(data);
    } catch (error) {
      console.error(error);
      console.log(error);
      setErrors(error);
    }
  }

  async function addStudent() {
    try {
      const response = await fetch("http://localhost:3307/students", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Creation failed");
      const newStudent = await response.json();
      setStudents([...students, newStudent]);
    } catch (err) {
      console.error(err);
      console.log(err);
      setErrors(err);
    }
  }

  async function editStudent() {
    try {
      const response = await fetch(
        `http://localhost:3307/students/${editingId}`,
        {
          method: "PUT",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Update failed");

      setStudents(
        students.map((student) =>
          student.id === editingId ? {...formData, id: editingId} : student
        )
      );
    } catch (error) {
      console.error(error);
      console.log(error);
      setErrors(error);
    }
  }

  async function deleteStudent(id) {
    const response = await fetch(`http://localhost:3307/students/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Delete failed");
    setStudents(students.filter((student) => student.id !== id));
  }
  async function handleSubmit(e) {
    e.preventDefault();

    if (editingId) {
      editStudent();
    } else {
      addStudent();
    }

    setFormData({name: "", email: "", age: ""});
    setEditingId(null);
    setErrors([]);
  }

  useEffect(() => {
    getStudents();
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center gap-16 p-10">
      <div className="w-full flex flex-col items-center justify-center gap-5">
        <h1 className="text-4xl font-bold">Students</h1>
        <table className="w-full border-2">
          <thead>
            <tr className="border text-left">
              <th>Name</th>
              <th>Email</th>
              <th>Age</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students &&
              students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.age}</td>
                  <td className="flex gap-2">
                    <button className="bg-yellow-300 px-2 py-1">Edit</button>
                    <button
                      className="bg-red-500 px-2 py-1"
                      onClick={() => deleteStudent(student.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-5">
          <input
            type="text"
            placeholder="Name"
            required
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            className="w-full p-2 border"
          />
          <input
            type="email"
            placeholder="Email"
            required
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            className="w-full p-2 border"
          />
          <input
            type="number"
            placeholder="Age"
            required
            name="age"
            value={formData.age}
            onChange={handleFormChange}
            className="w-full p-2 border"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white"
          >
            Add Student
          </button>
        </div>
      </form>
    </div>
  );
}
