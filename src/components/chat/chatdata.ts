import type { ChatEngine } from "@/types/chat";

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const containsAny = (text: string, keywords: string[]) =>
  keywords.some((kw) => text.includes(normalize(kw)));

/** Mock: khớp từ khóa → trả lời cố định từ knowledge base VIHEM 1 */
export const getMockReply = (message: string): string => {
  const q = normalize(message);

  // --- Liên hệ ---
  if (
    containsAny(q, ["lien he", "hotline", "sdt", "so dien thoai", "dien thoai", "goi", "email", "dia chi", "o dau", "van phong", "nha may"])
  ) {
    return "Công ty: Công ty Cổ phần Chế tạo Máy điện Việt Nam – Hungari 1 (VIHEM 1., JSC).\nĐịa chỉ: Khu Công nghiệp Hòa Khánh, TP. Đà Nẵng.\nHotline tư vấn quạt công nghiệp, bơm, động cơ: 0944 177 362.\nHotline tư vấn ống gió, van gió: 0944 177 321.\nEmail: vihemdanang@gmail.com / Ecowind.duct@gmail.com.";
  }

  // --- Giá / báo giá ---
  if (containsAny(q, ["gia", "bao gia", "chi phi", "bao nhieu tien", "mua hang", "dat hang"])) {
    return "Giá quạt phụ thuộc vào model, công suất, vật liệu, lưu lượng, áp suất, số lượng và yêu cầu công trình. Anh/chị gửi giúp em nhu cầu sử dụng hoặc thông số kỹ thuật, bên em sẽ hỗ trợ tư vấn và báo giá phù hợp. Hotline: 0944 177 362.";
  }

  // --- PCCC / hút khói / tăng áp cầu thang ---
  if (containsAny(q, ["pccc", "hut khoi", "tang ap cau thang", "chay no", "thoat hiem"])) {
    return "Với hệ thống hút khói hoặc tăng áp cầu thang, việc chọn quạt cần dựa trên tiêu chuẩn thiết kế, lưu lượng, áp suất, nhiệt độ, thời gian chịu nhiệt và bản vẽ hệ thống. Anh/chị vui lòng gửi hồ sơ kỹ thuật để bộ phận kỹ thuật tư vấn chính xác. Hotline: 0944 177 362.";
  }

  // --- Bảo trì / sửa chữa ---
  if (
    containsAny(q, [
      "bao tri",
      "bao duong",
      "sua chua",
      "sua motor",
      "sua dong co",
      "can bang dong",
      "do rung",
      "rung manh",
      "rung",
      "tieng la",
      "chay yeu",
      "yeu hon",
    ])
  ) {
    return "VIHEM 1 có hỗ trợ bảo trì, bảo dưỡng, sửa chữa động cơ điện, cân bằng động cánh quạt, đo độ rung và xử lý các vấn đề vận hành. Anh/chị vui lòng gửi tình trạng thiết bị, ảnh/video, công suất, model và hiện tượng lỗi để kỹ thuật kiểm tra. Hotline: 0944 177 362.";
  }

  // --- Dự án tiêu biểu ---
  if (containsAny(q, ["du an", "cong trinh", "khach hang", "tieu bieu", "catalogue"])) {
    return "VIHEM 1 đã có sản phẩm và dịch vụ được sử dụng trong một số công trình như khách sạn Mường Thanh, khách sạn Nagila, khách sạn Phạm Gia, dự án nhà máy xi măng, hệ thống hút bụi Cyclon và dịch vụ cân bằng cánh quạt – đo rung gối đỡ cho hệ thống công nghiệp.";
  }

  // --- Thành tựu / chứng nhận ---
  if (containsAny(q, ["thanh tuu", "chung nhan", "giai thuong", "cup vang", "chat luong viet nam"])) {
    return "VIHEM 1 đã đạt nhiều chứng nhận và giải thưởng trong lĩnh vực máy điện và quạt công nghiệp, nổi bật như Giải thưởng Chất lượng Việt Nam, Huy chương vàng sản phẩm động cơ điện, Cúp vàng Thăng Long và các giải thưởng thương hiệu mạnh.";
  }

  // --- Dòng quạt cụ thể ---
  if (containsAny(q, ["cvt20"])) {
    return "Dòng CVT20 phù hợp cho hệ thống thông gió thấp áp, cần thiết bị nhỏ gọn, ổn định và ít nhạy cảm với bụi. Nếu công trình cần áp suất cao hơn, anh/chị nên gửi lưu lượng, áp suất và bản vẽ hệ thống để kỹ thuật tư vấn dòng phù hợp hơn.";
  }

  if (containsAny(q, ["cvt10", "cvt15"])) {
    return "CVT10 – CVT15 phù hợp cho hệ thống thông gió hoặc hút bụi nhẹ, nơi cần lưu lượng lớn và hiệu suất khá cao. Tuy nhiên cần thiết kế đúng trở lực hệ thống để tránh quá tải động cơ.";
  }

  if (containsAny(q, ["cvc13", "cvc21", "cvc31"])) {
    return "CVC13 – CVC21 – CVC31 phù hợp cho hệ thống thông gió sạch hoặc ít bụi, cần hiệu suất cao và độ ồn thấp. Nếu môi trường nhiều bụi bám, nên để kỹ thuật kiểm tra lại trước khi chọn.";
  }

  if (containsAny(q, ["cv.b", "cvb", "cao ap"])) {
    return "Dòng CV.B phù hợp với các hệ thống cần áp suất cao như cấp khí đầu đốt, lò hơi, hút bụi, vận chuyển vật liệu hoặc hệ thống công nghiệp có trở lực lớn. Để chọn model chính xác, anh/chị vui lòng cung cấp lưu lượng, áp suất, môi trường khí và bản vẽ đường ống nếu có.";
  }

  if (containsAny(q, ["cvp7"])) {
    return "CVP7 phù hợp cho hệ thống trung áp – cao áp trong môi trường sạch hoặc ít bụi, cần hiệu suất tốt và độ ồn thấp.";
  }

  if (containsAny(q, ["cv.cd21", "cv.cd31", "cv.td20", "cd21", "cd31", "td20"])) {
    return "CV.CD21 – CV.CD31 – CV.TD20 phù hợp với hệ thống cần lưu lượng lớn, áp suất thấp như điều hòa không khí, tăng áp cầu thang hoặc sấy nông sản. Dòng này không nên dùng cho nhiệm vụ hút nếu không có thiết kế miệng nối đầu vào phù hợp.";
  }

  if (containsAny(q, ["avr", "avs"])) {
    return "Quạt hướng trục AVR/AVS phù hợp cho thông gió, cấp khí tươi, hút tầng hầm, văn phòng, kho hàng và nhà xưởng. Nếu hệ thống có đường ống dài hoặc cần áp suất cao, anh/chị nên cân nhắc quạt ly tâm.";
  }

  if (containsAny(q, ["avt"])) {
    return "Quạt hướng trục AVT phù hợp cho tầng hầm, đường hầm, trung tâm thương mại và các công trình cần lưu lượng lớn, áp suất cao hơn quạt thông gió thông thường. Với hệ hút khói hoặc PCCC, anh/chị nên gửi yêu cầu kỹ thuật để bộ phận kỹ thuật tư vấn đúng tiêu chuẩn.";
  }

  if (containsAny(q, ["co chop", "chop"])) {
    return "Quạt hướng trục có chớp phù hợp cho nhà xưởng, kho hàng, phòng kín hoặc trang trại cần thông gió gắn tường. Nếu hệ thống có ống gió dài hoặc trở lực lớn, nên chuyển sang dòng quạt ly tâm.";
  }

  if (containsAny(q, ["mvr", "hon luu"])) {
    return "Quạt hỗn lưu MVR phù hợp khi cần lưu lượng tương đối lớn và áp suất tốt hơn quạt hướng trục thông thường. Dòng này thường dùng cho tầng hầm, văn phòng, kho hàng hoặc tăng áp cầu thang.";
  }

  if (containsAny(q, ["cay cong nghiep", "quat cay", "lam mat"])) {
    return "Quạt cây công nghiệp phù hợp để làm mát trực tiếp cho công nhân và khu vực sản xuất. Nếu anh/chị cần thông gió tổng thể cho nhà xưởng, nên kết hợp thêm quạt hút, quạt cấp khí hoặc hệ thống ống gió.";
  }

  // --- So sánh / chọn quạt ---
  if (containsAny(q, ["ly tam va huong truc", "khac nhau", "khac gi"])) {
    return "Quạt hướng trục thường phù hợp thông gió lưu lượng lớn, áp suất thấp. Quạt ly tâm phù hợp hệ thống có áp suất cao hơn, đường ống dài hơn hoặc cần hút/thổi qua hệ thống có trở lực.";
  }

  if (containsAny(q, ["hut bui"])) {
    return "Tùy loại bụi và áp suất hệ thống. Với hệ thống hút bụi, hút khói bụi, lò hơi hoặc lọc bụi, thường cần quạt ly tâm hoặc quạt ly tâm cao áp. Khách nên cung cấp lưu lượng, áp suất, loại bụi và bản vẽ đường ống để kỹ thuật chọn model.";
  }

  if (containsAny(q, ["nha xuong", "xuong san xuat"])) {
    return "Nếu cần làm mát trực tiếp, có thể chọn quạt cây công nghiệp. Nếu cần thông gió tổng thể, nên dùng quạt hướng trục, quạt có chớp hoặc hệ thống quạt – ống gió tùy diện tích và nhu cầu hút/cấp khí.";
  }

  if (
    containsAny(q, [
      "chon quat",
      "nen chon",
      "tu van quat",
      "loai quat",
      "quat nao",
      "mua quat",
      "can quat",
    ])
  ) {
    return "Để tư vấn đúng loại quạt, anh/chị cho em xin thêm: mục đích sử dụng, lưu lượng cần đạt, áp suất, diện tích/khu vực lắp đặt, môi trường khí, nguồn điện và bản vẽ hệ thống nếu có. Nếu chưa có thông số, anh/chị có thể gửi ảnh hiện trạng để kỹ thuật hỗ trợ sơ bộ.";
  }

  // --- Nhóm sản phẩm ---
  if (containsAny(q, ["ong gio", "van gio", "mieng gio", "hvac", "thong gio"])) {
    return "Bên cạnh quạt và động cơ, VIHEM 1 còn cung cấp giải pháp thông gió đồng bộ gồm ống gió, van gió, miệng gió và phụ kiện, phù hợp cho nhà xưởng, tòa nhà, tầng hầm, khách sạn và hệ thống HVAC. Hotline ống gió, van gió: 0944 177 321.";
  }

  if (containsAny(q, ["dong co", "motor", "dien 3 pha", "dien 1 pha"])) {
    return "VIHEM 1 cung cấp và phân phối động cơ điện phục vụ sản xuất công nghiệp, hệ thống quạt, bơm, truyền động và các dây chuyền máy móc. Các dòng gồm động cơ 1 pha, 3 pha, công suất lớn, phòng nổ, phanh từ và bộ điều tốc.";
  }

  if (containsAny(q, ["bom", "bom ly tam", "bom chan khong"])) {
    return "VIHEM 1 cung cấp các dòng bơm công nghiệp dùng trong cấp thoát nước, hệ thống sản xuất, nhà máy, công trình kỹ thuật và các ứng dụng yêu cầu lưu lượng lớn. Hotline: 0944 177 362.";
  }

  if (containsAny(q, ["dich vu", "tu van thiet ke", "can bang", "khao sat"])) {
    return "VIHEM 1 không chỉ bán thiết bị mà còn hỗ trợ kỹ thuật, tư vấn lựa chọn, sửa chữa, bảo trì và cân bằng động để hệ thống vận hành ổn định hơn. Hotline: 0944 177 362.";
  }

  if (containsAny(q, ["san xuat quat", "co san xuat"])) {
    return "Có. VIHEM 1 sản xuất nhiều dòng quạt công nghiệp như quạt hướng trục, quạt ly tâm, quạt hỗn lưu, quạt cây công nghiệp, quạt đường hầm, quạt nối ống gió và quạt tăng áp cầu thang.";
  }

  if (containsAny(q, ["thiet ke theo yeu cau", "theo yeu cau", "custom"])) {
    return "Có. VIHEM 1 có thể tư vấn và thiết kế quạt theo yêu cầu lưu lượng, áp suất và điều kiện làm việc của từng công trình.";
  }

  if (containsAny(q, ["san pham", "co nhung gi", "ban gi", "danh muc"])) {
    return "VIHEM 1 cung cấp quạt công nghiệp, động cơ điện, bơm công nghiệp, hộp giảm tốc, bộ điều tốc, ống gió, van gió, miệng gió và các dịch vụ kỹ thuật như bảo trì, sửa chữa, cân bằng động và tư vấn hệ thống HVAC.";
  }

  if (containsAny(q, ["quat cong nghiep", "quat ly tam", "quat huong truc"])) {
    return "VIHEM 1 cung cấp nhiều dòng quạt công nghiệp phục vụ thông gió, hút khói, hút bụi, cấp khí tươi, tăng áp cầu thang, làm mát nhà xưởng, hút tầng hầm và các hệ thống công nghiệp cần lưu lượng – áp suất theo thiết kế.";
  }

  if (containsAny(q, ["nganh", "ung dung", "dung trong"])) {
    return "Sản phẩm VIHEM 1 được dùng trong dầu khí, xây dựng, chế tạo thiết bị, khai thác mỏ, xi măng, thép, giấy, vật liệu xây dựng, chế biến nông – lâm – hải sản, thủy lợi, mía đường, nuôi trồng thủy sản và các ngành công nghiệp khác.";
  }

  if (containsAny(q, ["lap dat", "tu lap"])) {
    return "Với quạt công nghiệp, đặc biệt là quạt công suất lớn, hệ thống 3 pha, PCCC, hút bụi, hút khói hoặc hệ thống có đường ống, nên để kỹ thuật viên có chuyên môn lắp đặt và kiểm tra.";
  }

  // --- Công ty / giới thiệu ---
  if (
    containsAny(q, [
      "vihem",
      "cong ty",
      "la gi",
      "gioi thieu",
      "lam gi",
      "ve ban",
      "thuong hieu",
      "chat luong tao nen gia tri",
    ])
  ) {
    return "VIHEM 1 là đơn vị chuyên sản xuất và cung cấp máy điện, động cơ điện, quạt công nghiệp, bơm công nghiệp, hộp giảm tốc và hệ thống thông gió. Công ty có các dòng quạt hướng trục, quạt ly tâm, quạt hỗn lưu, quạt cây công nghiệp, quạt tăng áp cầu thang và giải pháp thông gió cho nhà xưởng, tòa nhà, tầng hầm và nhà máy. Thông điệp thương hiệu: \"Chất lượng tạo nên giá trị.\"";
  }

  // --- Fallback ---
  return "Cảm ơn anh/chị! Em chưa hiểu rõ câu hỏi. Anh/chị có thể hỏi về sản phẩm (quạt, động cơ, bơm, ống gió), dịch vụ kỹ thuật, báo giá hoặc liên hệ hotline 0944 177 362 / 0944 177 321.";
};

/** Gợi ý câu hỏi nhanh cho người dùng */
export const SUGGESTED_QUESTIONS = [
  "VIHEM 1 là công ty gì?",
  "VIHEM 1 có những sản phẩm nào?",
  "Tôi cần quạt cho nhà xưởng thì chọn loại nào?",
  "Giá sản phẩm VIHEM 1 là bao nhiêu?",
  "Thông tin liên hệ VIHEM 1?",
  "Quạt ly tâm và quạt hướng trục khác nhau thế nào?",
] as const;

export const mockChatEngine: ChatEngine = {
  sendMessage: async (message) => {
    await new Promise((r) => setTimeout(r, 600));
    return getMockReply(message);
  },
};
