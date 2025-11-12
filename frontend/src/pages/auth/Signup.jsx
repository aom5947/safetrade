import { useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";

function Signup({ onContinue, onSwitch }) {
  const [mobile, setMobile] = useState("");

  const handleSignup = () => {

  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">Sign-up account</h2>

      <Input
        type="tel"
        placeholder="Mobile number"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
      />

      <div className="flex items-start gap-2 mt-4 text-sm">
        <input type="checkbox" className="mt-1" />
        <span>
          I have read and agree to{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
        </span>
      </div>

      <div className="mt-6 space-y-3">
        <Button variant="primary" onClick={handleSignup}>
          Continue
        </Button>
        <Button variant="secondary" onClick={onSwitch}>
          Back to Login
        </Button>
      </div>

      <div className="flex items-center my-6">
        <hr className="flex-1 border-gray-300" />
        <span className="px-3 text-gray-500 text-sm">or</span>
        <hr className="flex-1 border-gray-300" />
      </div>
    </div>
  );
}

export default Signup;
