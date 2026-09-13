export interface ParsedBookmark {
  name: string;
  url: string;
  folder: string | null;
}

export interface ParsedBookmarkFolder {
  name: string;
  bookmarks: ParsedBookmark[];
  subfolders: ParsedBookmarkFolder[];
}

export function parseBookmarksHtml(html: string): { folders: ParsedBookmarkFolder[]; bookmarks: ParsedBookmark[] } {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const topDl = doc.querySelector('DL');
  if (!topDl) return { folders: [], bookmarks: [] };

  const root: ParsedBookmarkFolder = { name: '__root__', bookmarks: [], subfolders: [] };
  parseDl(topDl, root);

  return { folders: root.subfolders, bookmarks: root.bookmarks };
}

function parseDl(dl: Element, currentFolder: ParsedBookmarkFolder): void {
  const children = Array.from(dl.children);
  let i = 0;
  while (i < children.length) {
    const child = children[i];

    if (child.tagName === 'DT') {
      const h3 = child.querySelector(':scope > H3');
      const a = child.querySelector(':scope > A');

      if (h3) {
        const folderName = h3.textContent?.trim() ?? 'Sem nome';
        const newFolder: ParsedBookmarkFolder = { name: folderName, bookmarks: [], subfolders: [] };
        currentFolder.subfolders.push(newFolder);

        // Find the next DL sibling (the folder's contents)
        const nextDl = child.querySelector(':scope > DL');
        if (nextDl) {
          parseDl(nextDl, newFolder);
        }
      } else if (a) {
        const name = a.textContent?.trim() ?? '';
        const url = a.getAttribute('HREF') ?? '';
        if (name && url && /^https?:\/\//i.test(url)) {
          currentFolder.bookmarks.push({ name, url, folder: null });
        }
      }
    }

    i++;
  }
}

export function flattenBookmarks(
  folders: ParsedBookmarkFolder[],
  rootBookmarks: ParsedBookmark[],
  existingFolderNames: Set<string>
): { foldersToCreate: { name: string }[]; linksToCreate: { name: string; url: string; folderName: string | null }[] } {
  const foldersToCreate: { name: string }[] = [];
  const linksToCreate: { name: string; url: string; folderName: string | null }[] = [];

  for (const b of rootBookmarks) {
    linksToCreate.push({ name: b.name, url: b.url, folderName: null });
  }

  function walk(folder: ParsedBookmarkFolder, parentPath: string | null) {
    const fullName = parentPath ? `${parentPath} / ${folder.name}` : folder.name;
    if (!existingFolderNames.has(fullName)) {
      foldersToCreate.push({ name: fullName });
      existingFolderNames.add(fullName);
    }
    for (const b of folder.bookmarks) {
      linksToCreate.push({ name: b.name, url: b.url, folderName: fullName });
    }
    for (const sub of folder.subfolders) {
      walk(sub, fullName);
    }
  }

  for (const f of folders) {
    walk(f, null);
  }

  return { foldersToCreate, linksToCreate };
}
