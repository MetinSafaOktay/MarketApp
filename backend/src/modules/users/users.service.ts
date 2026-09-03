/** Kullanıcı profili + sosyal (takip) + hesap silme iş mantığı. */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

// Herkese açık yanıtlarda dönen alanlar — email/phone/şifre GİBİ hassas alanlar YOK.
// Hem GET /users/:id hem PATCH /users/me yanıtında kullanılır.
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

    // takipçi / takip edilen sayıları paralel çekilir
    const [followerCount, followingCount] = await Promise.all([
      this.prisma.follows.count({ where: { following_id: id } }),
      this.prisma.follows.count({ where: { follower_id: id } }),
    ]);

    return { ...user, followerCount, followingCount };
  }

  // PATCH yalnızca herkese açık alanları döndürür; istemci sonra /auth/me ile
  // tam kullanıcıyı tazeler (email/role gibi alanlar buradan gelmez).
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
      // follows tablosunda (follower_id, following_id) unique → çift ekleme patlar
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

  /**
   * Hesabı yumuşak siler: kimlik alanlarını anonimleştirir, oturumları iptal
   * eder, sepet/istek listesi/takip/push aboneliklerini temizler.
   * Siparişler ve mesajlar işletme kaydı olarak korunur.
   */
  async deleteAccount(userId: string) {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    await this.prisma.$transaction([
      this.prisma.cart_items.deleteMany({ where: { user_id: userId } }),
      this.prisma.wishlist_items.deleteMany({ where: { user_id: userId } }),
      this.prisma.push_subscriptions.deleteMany({ where: { user_id: userId } }),
      this.prisma.follows.deleteMany({
        where: {
          OR: [{ follower_id: userId }, { following_id: userId }],
        },
      }),
      // aktif oturumları kapat
      this.prisma.refresh_tokens.updateMany({
        where: { user_id: userId, revoked_at: null },
        data: { revoked_at: new Date() },
      }),
      // kimlik alanlarını sil/anonimleştir; satır kalır (siparişlere referans için)
      this.prisma.users.update({
        where: { id: userId },
        data: {
          is_active: false, // login artık reddedilir
          email: null,
          phone: null,
          password_hash: '',
          profile_name: 'Silinmiş Kullanıcı',
          first_name: '',
          last_name: '',
          bio: null,
          profile_photo_url: null,
          is_private: true,
          updated_at: new Date(),
        },
      }),
    ]); // $transaction: hepsi ya birlikte olur ya hiçbiri

    return { success: true };
  }
}
