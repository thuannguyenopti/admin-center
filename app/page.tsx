import { redirect } from "next/navigation";

/** Skip the mock login/password screen and land in Admin Center. */
export default function Home() {
	redirect("/admin-center/user-management/users");
}
