import { OFTEA_POSTS } from '../data/umkm-products';
import { UserOnboardingProfile, UMKMProductPost } from '../types';

export function getRecommendationsForProfile(profile: UserOnboardingProfile): UMKMProductPost[] {
  return OFTEA_POSTS.filter((post) => {
    if (post.bestForSkinTones && post.bestForSkinTones.includes(profile.skinTone)) return true;
    if (post.bestForBodyShapes && post.bestForBodyShapes.includes(profile.bodyShape)) return true;
    return true;
  });
}
