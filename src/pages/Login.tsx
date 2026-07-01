import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const handleStart = () => {
    const trimmed = name.trim();
    if (trimmed) {
      localStorage.setItem("urt_guest_name", trimmed);
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Welcome to Anneal</CardTitle>
          <CardDescription>
            No account needed to practice. Enter a display name if you plan
            to participate in the Community section, or just continue as a guest.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Display name (optional)</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
            />
          </div>
          <Button className="w-full" size="lg" onClick={handleStart}>
            {name.trim() ? "Save & Continue" : "Continue as Guest"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
