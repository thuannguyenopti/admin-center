import { redirect } from "next/navigation";

/** Home → Admin Center (also configured in next.config redirects). */
export default function Home() {
	redirect("/admin-center/user-management/users");
}
