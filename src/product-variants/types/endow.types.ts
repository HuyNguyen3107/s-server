// Hệ thống ưu đãi hoàn toàn linh hoạt - chỉ lưu text và hiển thị
export interface EndowSystem {
  items: EndowItem[];
  displaySettings?: EndowDisplaySettings;
}

export interface EndowItem {
  id: string;
  content: string; // Nội dung ưu đãi (text thuần túy)
  isActive: boolean;
  priority?: number; // Thứ tự hiển thị (optional)
  createdAt?: Date;
  updatedAt?: Date;
}

// Cài đặt hiển thị cho toàn bộ danh sách ưu đãi (optional)
export interface EndowDisplaySettings {
  showAsList: boolean; // true: hiển thị dạng list, false: hiển thị dạng paragraph
  separator?: string; // Ký tự phân cách khi hiển thị (mặc định là xuống dòng)
  prefix?: string; // Tiền tố cho mỗi item (vd: "✓ ", "• ", "🎁 ")
  maxItemsToShow?: number; // Giới hạn số item hiển thị
  showInactive?: boolean; // Có hiển thị item không active hay không
}

// Templates mẫu cho admin tham khảo (không bắt buộc theo)
export const ENDOW_EXAMPLES = {
  // Ví dụ từ hình ảnh của bạn
  GIFT_PACKAGE: [
    'Tặng kèm: Hộp quà + túi + thiệp (loại kraft)',
    'Tặng kèm: Hộp quà + túi + thiệp (loại kraft). Tặng 01 phụ kiện cắm tay (Không bao gồm pet)',
  ],
  COMBO_DEAL: [
    'Trọn bộ khung tốt nghiệp 280.000 đ (đã có phụ kiện mũ TN + hoa lego cắm tay)',
  ],
  FREE_ITEMS: ['Tặng 01 phụ kiện cắm tay (Không bao gồm pet)'],
  // Các ví dụ khác admin có thể dùng
  OTHER_EXAMPLES: [
    'Giảm 20% cho đơn hàng từ 500.000đ',
    'Miễn phí giao hàng toàn quốc',
    'Mua 2 tặng 1',
    'Tặng voucher 100.000đ cho lần mua tiếp theo',
    'Bảo hành mở rộng 12 tháng',
    'Tư vấn miễn phí 24/7',
  ],
};

// Utility functions
export const createEndowItem = (
  content: string,
  priority?: number,
): Omit<EndowItem, 'id'> => ({
  content: content.trim(),
  isActive: true,
  priority: priority || 1,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const validateEndowSystem = (
  endowSystem: any,
): endowSystem is EndowSystem => {
  if (!endowSystem || typeof endowSystem !== 'object') return false;
  if (!Array.isArray(endowSystem.items)) return false;

  return endowSystem.items.every(
    (item: any) =>
      item &&
      typeof item === 'object' &&
      typeof item.content === 'string' &&
      item.content.trim().length > 0 &&
      typeof item.isActive === 'boolean',
  );
};

export const formatEndowForDisplay = (endowSystem: EndowSystem): string[] => {
  if (!endowSystem || !endowSystem.items) return [];

  const settings = endowSystem.displaySettings || {
    showAsList: true,
    showInactive: false,
    prefix: '• ',
  };

  const activeItems = endowSystem.items
    .filter((item) => settings.showInactive || item.isActive)
    .sort((a, b) => (a.priority || 0) - (b.priority || 0));

  const itemsToShow = settings.maxItemsToShow
    ? activeItems.slice(0, settings.maxItemsToShow)
    : activeItems;

  return itemsToShow.map((item) => {
    const prefix = settings.prefix || '';
    return prefix + item.content;
  });
};
