import { useMemo } from "react";

import type { UserProfile } from "../types/UserProfile";
import { identityRuntime } from "../IdentityRuntime";

interface ProfileHeaderProps {
  profile: UserProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="profile-card">
      <div className="profile-avatar">{profile.avatar ?? "👤"}</div>
      <div className="profile-body">
        <h2>{profile.displayName}</h2>
        <p className="muted">@{profile.username}</p>
        <p>{profile.bio ?? "No bio yet."}</p>
        <p className="muted">Theme: {profile.theme}</p>
      </div>
    </div>
  );
}

export function ProfileStats() {
  const profile = identityRuntime.getCurrentProfile() ?? identityRuntime.signInGuest();
  const library = identityRuntime.getLibrary();
  const achievements = identityRuntime.getAchievements();

  const stats = useMemo(
    () => [
      { label: "Library Items", value: String(library.length) },
      { label: "Achievements", value: String(achievements.length) },
      { label: "Products", value: String(library.filter((item) => item.type === "game" || item.type === "app" || item.type === "template").length) },
      { label: "Role", value: profile.roles[0] ?? "guest" },
    ],
    [achievements.length, library, profile],
  );

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div className="card stat-card" key={stat.label}>
          <div className="stat-label">{stat.label}</div>
          <div className="stat-value">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

export function ProfileProjects() {
  const profile = identityRuntime.getCurrentProfile() ?? identityRuntime.signInGuest();
  const library = identityRuntime.getLibrary();

  const projects = useMemo(
    () => [
      {
        id: "project-portal",
        name: `${profile.displayName}'s Portal`,
        status: "Published",
      },
      ...library.slice(0, 2).map((item) => ({
        id: item.id,
        name: item.name,
        status: "Installed",
      })),
    ],
    [library, profile.displayName],
  );

  return (
    <div className="panel">
      <h3>Projects</h3>
      <div className="stack-list">
        {projects.map((project) => (
          <div className="list-row" key={project.id}>
            <span>{project.name}</span>
            <span className="badge">{project.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const profile = identityRuntime.getCurrentProfile() ?? identityRuntime.signInGuest();

  return (
    <section className="screen">
      <div className="screen-header">
        <h1>Profile</h1>
      </div>

      <ProfileHeader profile={profile} />
      <ProfileStats />
      <ProfileProjects />
    </section>
  );
}
