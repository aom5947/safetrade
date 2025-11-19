import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import { api } from "@/services/api";
import { Edit, LogOut } from "lucide-react";
import { ImageUploadDropzone } from "./image-upload-dropzone";

function Profile({ user, setUsers }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [uploadedImages, setUploadedImages] = useState([])
  const [submitStatus, setSubmitStatus] = useState(null)

  const navigate = useNavigate();

  useEffect(() => {
    initializeUserData();
  }, [user]);

  const initializeUserData = () => {
    const storedData = localStorage.getItem("userData");
    const storedToken = localStorage.getItem("token");

    if (storedToken) setToken(storedToken);

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        const userData = parsed.user || parsed;

        // Normalize null values to empty strings for form inputs
        const normalizedData = {
          ...userData,
          phone: userData.phone ?? "",
          avatar_url: userData.avatar_url ?? "",
          first_name: userData.first_name ?? "",
          last_name: userData.last_name ?? "",
        };

        setForm(normalizedData);
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    } else if (user) {
      const normalizedData = {
        ...user,
        phone: user.phone ?? "",
        avatar_url: user.avatar_url ?? "",
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
      };
      setForm(normalizedData);
    }
  };

  // const initializeUserData = () => {
  //   const storedData = localStorage.getItem("userData");
  //   const storedToken = localStorage.getItem("token");

  //   if (storedToken) setToken(storedToken);

  //   if (storedData) {
  //     try {
  //       const parsed = JSON.parse(storedData);
  //       const userData = parsed.user || parsed;
  //       setForm(userData);
  //     } catch (err) {
  //       console.error("Error parsing user data:", err);
  //     }
  //   } else if (user) {
  //     setForm(user);
  //   }
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateLocalStorage = (updatedUser) => {
    try {
      const storedData = localStorage.getItem("userData");
      const parsed = storedData ? JSON.parse(storedData) : {};

      const dataToStore = {
        ...parsed,
        ...updatedUser,
      };

      initializeUserData();
      localStorage.setItem("userData", JSON.stringify(dataToStore));
    } catch (err) {
      console.error("Error updating localStorage:", err);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    const payload = {
      username: form.username,
      email: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      avatar_url: uploadedImages[0],
    };

    try {
      if (token) {
        const res = await api.patch("/users/edit-profile", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.data?.success && res.data?.user) {
          const updatedUser = res.data.user;
          updateLocalStorage(updatedUser);
          setForm(updatedUser);
          setUsers?.(updatedUser);
          setIsEditing(false);
        } else {
          throw new Error("Unexpected response format");
        }
      } else {
        // Offline mode
        updateLocalStorage(form);
        setUsers?.(form);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      const errorMsg = err?.response?.data?.message || err.message || "เกิดข้อผิดพลาดขณะอัพเดทโปรไฟล์";
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    navigate("/");
  };

  const handleCancel = () => {
    initializeUserData();
    setIsEditing(false);
  };

  if (!form || Object.keys(form).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar role="buyer" />
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-center text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  // แก้จากใส่ url ให้เพิ่มรูปเองโดยใช้ uploadthing

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="buyer" />

      <div className="mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
          ข้อมูลส่วนตัว
        </h1>

        <div className="bg-white rounded-xl shadow-md p-6">
          {!isEditing ? (
            <ProfileView
              form={form}
              onEdit={() => setIsEditing(true)}
              onLogout={handleLogout}
            />
          ) : (
            <ProfileEdit
              form={form}
              onChange={handleChange}
              onSave={handleSave}
              onCancel={handleCancel}
              isLoading={isLoading}
              setUploadedImages={setUploadedImages}
              setSubmitStatus={setSubmitStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileView({ form, onEdit, onLogout }) {
  return (
    <>
      <div className="grid items-center gap-6">
        {form.avatar_url ? (
          <div className="mx-auto flex items-center lg:w-56 lg:h-56">
            <img
              src={form.avatar_url}
              alt="user-profile"
              className="w-full h-full rounded-md object-cover aspect-square"
            />
          </div>
        ) : (
          <div className="mx-auto flex items-center lg:w-56 lg:h-56">
            <img
              src={'https://placehold.co/600x400.png'}
              alt="user-profile"
              className="w-full h-full rounded-md object-cover aspect-square"
            />
          </div>
          // <FaUserCircle className="text-6xl text-gray-400" />
        )}
        <div className="space-y-2">
          <h2 className="text-xl font-bold">ชื่อผู้ใช้ {form.username}</h2>
          <p className="text-gray-600">ไอดี {form.user_id}</p>
          <p className="text-gray-600">อีเมล์ {form.email}</p>
          <p className="text-gray-600">เบอร์โทร {form.phone || "-"}</p>
          <p className="text-sm">Role: {form.user_role || form.role || "user"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6 text-sm bg-slate-100 rounded-md">
        <div className='p-2'>
          <p className="font-semibold">First Name</p>
          <p>{form.first_name || "-"}</p>
        </div>
        <div className='p-2'>
          <p className="font-semibold">Last Name</p>
          <p>{form.last_name || "-"}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all duration-200 font-medium"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 border-2 border-red-600 rounded-xl hover:bg-red-50 hover:shadow-lg transition-all duration-200 font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </>
  );
}

function ProfileEdit({ form, onChange, onSave, onCancel, isLoading, setUploadedImages }) {
  return (
    <>
      <div className="space-y-4">
        <input
          type="text"
          name="username"
          value={form.username || ""}
          onChange={onChange}
          placeholder="Username"
          className="w-full border rounded px-3 py-2"
          disabled={isLoading}
        />
        <input
          type="email"
          name="email"
          value={form.email || ""}
          onChange={onChange}
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          disabled={isLoading}
        />
        <div className="flex gap-4">
          <input
            type="text"
            name="first_name"
            value={form.first_name || ""}
            onChange={onChange}
            placeholder="First Name"
            className="flex-1 border rounded px-3 py-2"
            disabled={isLoading}
          />
          <input
            type="text"
            name="last_name"
            value={form.last_name || ""}
            onChange={onChange}
            placeholder="Last Name"
            className="flex-1 border rounded px-3 py-2"
            disabled={isLoading}
          />
        </div>
        <input
          type="text"
          name="phone"
          value={form.phone || ""}
          onChange={onChange}
          placeholder="Phone"
          className="w-full border rounded px-3 py-2"
          disabled={isLoading}
        />
        <ImageUploadDropzone
          maxImages={1}
          headerText={'Update Image Profile'}
          onImagesChange={(images) => {
            setUploadedImages(images)
          }}
          onUploadError={(error) => {
            setSubmitStatus({
              type: "error",
              message: `เกิดข้อผิดพลาด: ${error}`,
            })
          }}
        />
        <input
          type="text"
          name="avatar_url"
          value={form.avatar_url || ""}
          onChange={onChange}
          placeholder="Avatar URL"
          className="w-full border rounded px-3 py-2"
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-4 mt-6">
        <button
          className="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
        <button
          className="px-5 py-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500 transition disabled:opacity-50"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </>
  );
}

export default Profile;