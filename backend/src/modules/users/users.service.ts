import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

const PUBLIC_PROFILE_SELECT = {
  id: true,
  profile_name: true,
  first_name: true,
  last_name: true,
  profile_photo_url: true,
  bio: true,
  is_private: true,
  last_active_at: true,
  created_at: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicProfile(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: PUBLIC_PROFILE_SELECT,
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    const [followerCount, followingCount] = await Promise.all([
      this.prisma.follows.count({ where: { following_id: id } }),
      this.prisma.follows.count({ where: { follower_id: id } }),
    ]);

    return { ...user, followerCount, followingCount };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.users.update({
      where: { id: userId },
      data: dto,
      select: PUBLIC_PROFILE_SELECT,
    });
  }

  async follow(followerId: string, targetId: string) {
    if (followerId === targetId) {
      throw new BadRequestException('Kendinizi takip edemezsiniz');
    }
    const target = await this.prisma.users.findUnique({
      where: { id: targetId },
    });
    if (!target) throw new NotFoundException('Kullanıcı bulunamadı');

    try {
      await this.prisma.follows.create({
        data: { follower_id: followerId, following_id: targetId },
      });
    } catch {
      throw new ConflictException('Zaten takip ediliyor');
    }
    return { success: true };
  }

  async unfollow(followerId: string, targetId: string) {
    await this.prisma.follows.deleteMany({
      where: { follower_id: followerId, following_id: targetId },
    });
    return { success: true };
  }
}
