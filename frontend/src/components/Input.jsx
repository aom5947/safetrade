function Input({ name, type = "text", placeholder, value, onChange }) {
  return (
    <input
      name={name}   // ✅ ต้องส่ง name กลับไปด้วย
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  );
}

export default Input;