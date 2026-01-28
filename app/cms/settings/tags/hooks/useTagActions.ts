import { useCallback } from 'react';
import { Tag, TagFormRow } from '../types';

export function useTagActions(
  tags: Tag[],
  setTags: (tags: Tag[]) => void
) {
  const createTags = useCallback(
    (formRows: TagFormRow[]) => {
      const newTags: Tag[] = formRows.map((row) => ({
        id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: row.name,
        slug: row.slug,
        visibility: row.visibility,
        modifiedBy: 'Current User',
        usage: 0,
        lastModified: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      }));

      setTags([...tags, ...newTags]);
    },
    [tags, setTags]
  );

  const updateTags = useCallback(
    (formRows: TagFormRow[]) => {
      const updatedTags = tags.map((tag) => {
        const formRow = formRows.find((row) => row.id === tag.id);
        if (formRow) {
          return {
            ...tag,
            name: formRow.name,
            slug: formRow.slug,
            visibility: formRow.visibility,
            lastModified: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          };
        }
        return tag;
      });

      setTags(updatedTags);
    },
    [tags, setTags]
  );

  const deleteTags = useCallback(
    (ids: string[]) => {
      const remaining = tags.filter((t) => !ids.includes(t.id));
      setTags(remaining);
    },
    [tags, setTags]
  );

  return {
    createTags,
    updateTags,
    deleteTags,
  };
}
