import sqlite3 from 'sqlite3';

const db = new sqlite3.Database(`${__dirname}/../../data/db.sqlite`);

const connectToDB = async () => {
  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (discordId TEXT, clicks INTEGER)');
  });
};

interface TDbRow {
  discordId: string;
  clicks: number;
}

export const getUserCookies = (discordId: string) => {
  return new Promise<number>((resolve, reject) => {
    db.get(
      'SELECT clicks FROM users WHERE discordId = ?',
      [discordId],
      (err, row: Omit<TDbRow, 'discordId'>) => {
        if (err) {
          reject(err);
        } else {
          if (!row) {
            resolve(0);
          } else {
            resolve(row.clicks || 0);
          }
        }
      },
    );
  });
};

export const addCookie = (discordId: string) => {
  return new Promise<number>((resolve) => {
    db.serialize(() => {
      db.get(
        'SELECT clicks FROM users WHERE discordId = (?)',
        discordId,
        (err, row) => {
          if (!row) {
            const stmt = db.prepare('INSERT INTO users VALUES (?, ?)');
            const newCookies = 1;
            stmt.run(discordId, newCookies);
            stmt.finalize(() => resolve(newCookies));
          } else {
            const stmt = db.prepare(
              'UPDATE users SET clicks = (?) WHERE discordId = (?)',
            );
            const newCookies = row.clicks + 1;
            stmt.run(newCookies, discordId);
            stmt.finalize(() => resolve(newCookies));
          }
        },
      );
    });
  });
};

export const setUsersCookies = (discordId: string, clicks: number) => {
  if (clicks < 0) {
    throw new Error('Cannot set negative amount of cookies');
  }

  return new Promise<void>((resolve) => {
    db.serialize(() => {
      // Update the users clicks if they exist. Otherwise, insert them.
      db.get(
        'SELECT clicks FROM users WHERE discordId = (?)',
        discordId,
        (err, row) => {
          if (!row) {
            const stmt = db.prepare('INSERT INTO users VALUES (?, ?)');
            stmt.run(discordId, clicks);
            stmt.finalize(() => resolve());
          } else {
            const stmt = db.prepare(
              'UPDATE users SET clicks = (?) WHERE discordId = (?)',
            );
            stmt.run(clicks, discordId);
            stmt.finalize(() => resolve());
          }
        },
      );
    });
  });
};

export const getEveryonesCookies = () => {
  return new Promise<TDbRow[]>((resolve) => {
    db.serialize(() => {
      db.all('SELECT * FROM users', (err, rows) => {
        if (!rows) {
          resolve([]);
        } else {
          resolve(rows);
        }
      });
    });
  });
};

export default connectToDB;
