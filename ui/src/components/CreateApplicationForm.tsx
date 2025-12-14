import styles from './CreateApplicationForm.module.css';

export function CreateApplicationForm() {
  return (
    <div className={styles.container}>
      <h2>Create New Application</h2>
      <form className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="app-name" className={styles.label}>
            Application Name
          </label>
          <input
            type="text"
            id="app-name"
            name="name"
            className={styles.input}
            placeholder="Enter application name"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="app-description" className={styles.label}>
            Description
          </label>
          <textarea
            id="app-description"
            name="description"
            className={styles.textarea}
            placeholder="Enter application description (optional)"
            rows={4}
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          Create Application
        </button>
      </form>
    </div>
  );
}
