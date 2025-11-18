import { useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { api } from "@/services/api";

function Login({ onSwitch, onSuccess, setToken, setUsers }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    try {
      console.log(email, password);

      const response = await api.post("/users/signin", {
        email,
        password,
      });

      const user = response.data.user;

      setUsers(user);
      localStorage.setItem("userData", JSON.stringify(user));

      const token = response.data.token;
      setToken(token);
      localStorage.setItem("token", token);

      const user_role = response.data.user.user_role;
      // setToken(user_role);
      localStorage.setItem("user_role", user_role);

      if (onSuccess) {
        toast.success(response.data.message)
        // alert(response.data.message);
        onSuccess();
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      // alert(error.response?.data?. || "Login failed!");
      toast.error(error.response?.data.message)
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">Welcome back!</h2>

      <div className="space-y-4">
        <Input
          type="email"
          placeholder="E-mail or mobile number"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <div></div>
        <button onClick={onSwitch} className="text-blue-600 hover:underline">
          Sign-up
        </button>
      </div>

      <div className="mt-6 space-y-3">
        <Button variant="primary" onClick={handleLogin}>
          Login
        </Button>
        <Button variant="secondary">Later</Button>
      </div>
    </div>
  );
}

export default Login;
