/**
 * Creates a person or business, then its membership, then links them. The owner
 * goes first because that is the step likely to be refused (a duplicate email),
 * and failing there leaves nothing behind. If a later step fails, the new owner
 * is removed so retrying the form can't create a duplicate.
 */
export async function createWithMembership<Owner extends { id: string }, Membership extends { id: string }>(steps: {
  createOwner: () => Promise<Owner>;
  createMembership: () => Promise<Membership>;
  link: (ownerId: string, membershipId: string) => Promise<unknown>;
  removeOwner: (ownerId: string) => Promise<unknown>;
}): Promise<Owner> {
  const owner = await steps.createOwner();
  try {
    const membership = await steps.createMembership();
    await steps.link(owner.id, membership.id);
    return owner;
  } catch (error) {
    await steps.removeOwner(owner.id).catch(() => undefined);
    throw error;
  }
}
