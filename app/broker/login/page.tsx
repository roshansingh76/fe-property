import { redirect } from "next/navigation";

export default function BrokerLoginPage() {
  redirect("/login?role=BROKER");
}