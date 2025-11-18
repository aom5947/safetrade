// frontend/src/pages/auth/ProfileSetup.jsx
import { useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { api } from "@/services/api";   // ✅ ใช้ axios instance ตัวเดียวกับ Login

function ProfileSetup({ onFinish,mobile }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    firstName: "",
    lastName: "",
    role: "buyer",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  console.log("📱 เบอร์ที่ส่งมาจาก Signup:", mobile);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // ✅ เคลียร์ error เมื่อพิมพ์
  };

  const handleSubmit = async () => {
    let newErrors = {};

    if (!form.email) newErrors.email = "E-mail is required";
    if (!form.password) newErrors.password = "Password is required";
    if (!form.confirmPassword) newErrors.confirmPassword = "Confirm your password";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!form.username) newErrors.username = "Username is required";
    if (!form.firstName) newErrors.firstName = "First name is required";
    if (!form.lastName) newErrors.lastName = "Last name is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return; // ❌ ถ้ามี error จะไม่บันทึก
    }

    // ✅ payload ต้องตรงกับ route /signup ใน backend
    const payload = {
      email: form.email,
      password: form.password,
      username: form.username,
      first_name: form.firstName,
      last_name: form.lastName,
      role: form.role,
      phone: mobile // buyer หรือ seller
    };

    try {
      setLoading(true);

      const res = await api.post("/users/signup", payload);

      alert(res.data?.message || "Signup success");

      // ถ้าอยากส่งข้อมูล user/id กลับให้ parent ใช้ onFinish
      if (onFinish) {
        onFinish({
          id: res.data?.id,
          email: form.email,
          username: form.username,
          role: form.role,
        });
      }
    } catch (err) {
      console.error("Signup failed:", err.response?.data || err.message);

      const msg = err.response?.data?.message || "Signup failed";

      alert(msg);

      // ถ้า backend ส่ง 400 มา แสดงว่ามี validation ผิด เช่น role ผิด, email ซ้ำ ฯลฯ
      if (err.response?.status === 400 || err.response?.status === 403) {
        // ถ้าจะ map message ลง field ก็ทำเพิ่มได้
        // ตอนนี้โชว์เป็น alert ไปก่อน
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">Set up your profile</h2>

      <div className="space-y-4">
        {/* Email */}
        <Input
          name="email"
          type="email"
          placeholder="E-mail address"
          value={form.email}
          onChange={handleChange}
          className={`border ${errors.email ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        {/* Password */}
        <Input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className={`border ${errors.password ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

        {/* Confirm Password */}
        <Input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className={`border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
        )}

        {/* Username */}
        <Input
          name="username"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className={`border ${errors.username ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}

        {/* Firstname & Lastname */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              name="firstName"
              type="text"
              placeholder="First name"
              value={form.firstName}
              onChange={handleChange}
              className={`border ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName}</p>
            )}
          </div>
          <div className="flex-1">
            <Input
              name="lastName"
              type="text"
              placeholder="Last name"
              value={form.lastName}
              onChange={handleChange}
              className={`border ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Role */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="seller"
              checked={form.role === "seller"}
              onChange={handleChange}
            />
            Seller
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="buyer"
              checked={form.role === "buyer"}
              onChange={handleChange}
            />
            Buyer
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 space-y-3">
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </Button>
        <Button variant="secondary">Later</Button>
      </div>
    </div>
  );
}

export default ProfileSetup;
