export const encodeBase64 = (str: string) => {
  return btoa(unescape(encodeURIComponent(str)));
};

export const decodeBase64 = (str: string) => {
  return decodeURIComponent(escape(atob(str)));
};

export async function fetchGithubFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  branch: string = 'main'
) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
       return null; // File doesn't exist yet
    }
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(`Fetch failed: ${err.message || res.statusText}`);
  }

  const data = await res.json();
  const text = decodeBase64(data.content);
  return { content: text, sha: data.sha };
}

export async function commitGithubFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  branch: string = 'main',
  content: string,
  sha: string | undefined, // undefined if creating a new file
  message: string
) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const encodedContent = encodeBase64(content);
  
  const body: any = {
    message,
    content: encodedContent,
    branch,
  };
  
  if (sha) {
    body.sha = sha;
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(`Commit failed: ${err.message || res.statusText}`);
  }

  return await res.json();
}
