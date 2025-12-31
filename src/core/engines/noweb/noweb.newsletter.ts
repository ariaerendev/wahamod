export interface NOWEBNewsletterMetadata {
  id: string;
  state: string;
  creation_time: number;
  name: string;
  nameTime: number;
  description: string;
  descriptionTime: number;
  invite: string;
  handle: string;
  picture: string | null;
  preview: string | null;
  reaction_codes: string | null;
  subscribers: number;
  verification: string;
  viewer_metadata: any;
}

export function toNewsletterMetadata(
  data: any,
): NOWEBNewsletterMetadata | null {
  if (data.state?.type === 'DELETED') {
    return null;
  }

  if (data.state?.type === 'NON_EXISTING') {
    return null;
  }

  return {
    id: data.id,
    state: data.state?.type,
    creation_time: +data.thread_metadata.creation_time,
    name: data.thread_metadata.name.text,
    nameTime: +data.thread_metadata.name.update_time,
    description: data.thread_metadata.description.text,
    descriptionTime: +data.thread_metadata.description.update_time,
    invite: data.thread_metadata.invite,
    handle: data.thread_metadata.handle,
    picture: data.thread_metadata.picture?.direct_path || null,
    preview: data.thread_metadata.preview?.direct_path || null,
    reaction_codes: data.thread_metadata?.settings?.reaction_codes?.value,
    subscribers: +data.thread_metadata.subscribers_count,
    verification: data.thread_metadata.verification,
    viewer_metadata: data.viewer_metadata,
  };
}
