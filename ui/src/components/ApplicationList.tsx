import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ApplicationResponse } from '../types/Application';
import styles from './ApplicationList.module.css';

export function ApplicationList() {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await api.getApplications();
        setApplications(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading applications...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (applications.length === 0) {
    return (
      <div className={styles.container}>
        <h2>Applications</h2>
        <div className={styles.empty}>
          <p>No applications found.</p>
          <p>Create your first application to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Applications</h2>
      <ul className={styles.list}>
        {applications.map((app) => (
          <li key={app.id} className={styles.item}>
            <h3 className={styles.name}>{app.name}</h3>
            {app.description && (
              <p className={styles.description}>{app.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
