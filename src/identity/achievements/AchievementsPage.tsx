import { identityRuntime } from "../IdentityRuntime";

export function AchievementCard({ achievement }: { achievement: { id: string; title: string; description: string; unlocked: boolean; progress: number; target: number } }) {
  const percent = achievement.target === 0 ? 0 : Math.round((achievement.progress / achievement.target) * 100);

  return (
    <div className="card achievement-card">
      <div className="achievement-topline">
        <h3>{achievement.title}</h3>
        <span className={`badge ${achievement.unlocked ? "success" : "muted"}`}>
          {achievement.unlocked ? "Unlocked" : `${percent}%`}
        </span>
      </div>
      <p>{achievement.description}</p>
      <div className="progress-bar">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const profile = identityRuntime.getCurrentProfile() ?? identityRuntime.signInGuest();
  const achievements = identityRuntime.getAchievements();

  return (
    <section className="screen">
      <div className="screen-header">
        <h1>Achievements</h1>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-label">Profile</div>
          <div className="stat-value">{profile.displayName}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Unlocked</div>
          <div className="stat-value">{achievements.filter((item) => item.unlocked).length}</div>
        </div>
      </div>

      <div className="portal-card-grid">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </section>
  );
}
