const axios = require('axios');
const crypto = require('crypto');

class TikTokService {
  constructor() {
    // User-Agents rotation
    this.userAgents = [
      'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Mobile Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'com.ss.android.ugc.trill/2613 (Linux; U; Android 10; en_US; Pixel 4; Build/QQ3A.200805.001; Cronet/58.0.2991.0)'
    ];
    
    // TikTok API endpoints discovered through reverse engineering
    this.endpoints = {
      videoInfo: 'https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/',
      videoInfoV2: 'https://api2-16-h2.musical.ly/aweme/v1/feed/',
      videoInfoV3: 'https://api.tiktokv.com/aweme/v1/feed/',
      shareInfo: 'https://m.tiktok.com/api/post/item_list/'
    };
  }
  
  async download(url) {
    try {
      console.log('🔍 Processing TikTok URL:', url);
      
      // Extract video ID from URL
      const videoId = this.extractVideoId(url);
      if (!videoId) {
        throw new Error('Không thể lấy Video ID từ URL');
      }
      
      console.log('📹 Video ID:', videoId);
      
      // Try multiple methods
      let result = null;
      
      // Method 1: Official API with device simulation
      try {
        console.log('🔄 Trying Method 1: Official API...');
        result = await this.fetchOfficialAPI(videoId);
      } catch (error) {
        console.log('Method 1 failed:', error.message);
      }
      
      // Method 2: Share info API
      if (!result) {
        try {
          console.log('🔄 Trying Method 2: Share API...');
          result = await this.fetchShareAPI(videoId);
        } catch (error) {
          console.log('Method 2 failed:', error.message);
        }
      }
      
      // Method 3: Web scraping simulation
      if (!result) {
        try {
          console.log('🔄 Trying Method 3: Web Scraping...');
          result = await this.fetchWebScraping(url);
        } catch (error) {
          console.log('Method 3 failed:', error.message);
        }
      }
      
      if (result && result.url) {
        return {
          success: true,
          platform: 'tiktok',
          url: result.url,
          music: result.music,
          title: result.title || 'TikTok Video',
          author: result.author || 'TikTok Creator',
          duration: result.duration,
          thumbnail: result.thumbnail,
          message: '✅ Tải thành công! Video đã sẵn sàng.'
        };
      }
      
      throw new Error('Tất cả phương pháp đều thất bại');
      
    } catch (error) {
      console.error('❌ TikTok download error:', error.message);
      throw error;
    }
  }
  
  // Method 1: Official API with proper headers
  async fetchOfficialAPI(videoId) {
    const randomUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    
    const params = {
      aweme_id: videoId,
      iid: this.generateIID(),
      device_id: this.generateDeviceId(),
      openudid: this.generateOpenUDID(),
      uuid: this.generateUUID(),
      os_version: '10',
      version_code: '2613',
      app_name: 'trill',
      device_type: 'Pixel 4',
      device_brand: 'Google',
      language: 'en',
      region: 'US',
      sys_region: 'US',
      carrier_region: 'US',
      carrier_region_v2: '310',
      build_number: '10.1.0',
      timezone_offset: '-28800',
      timezone_name: 'America/Los_Angeles',
      is_my_cn: '0',
      fp: this.generateFingerprint(),
      account_region: 'US'
    };
    
    const response = await axios.get(this.endpoints.videoInfo, {
      params: params,
      headers: {
        'User-Agent': randomUserAgent,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'X-Tt-Token': '',
        'sdk-version': '1',
        'X-SS-REQ-TICKET': Date.now().toString(),
        'X-Khronos': Math.floor(Date.now() / 1000).toString(),
        'X-Gorgon': this.generateGorgon(params, randomUserAgent)
      },
      timeout: 15000
    });
    
    console.log('📊 Official API Response Status:', response.status);
    
    if (response.data.aweme_list && response.data.aweme_list[0]) {
      const videoData = response.data.aweme_list[0];
      return this.parseVideoData(videoData);
    }
    
    throw new Error('Không tìm thấy video trong response');
  }
  
  // Method 2: Share info API (more reliable)
  async fetchShareAPI(videoId) {
    const response = await axios.get(this.endpoints.shareInfo, {
      params: {
        aid: '1988',
        count: '1',
        id: videoId
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Mobile Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.tiktok.com/',
        'Origin': 'https://www.tiktok.com'
      },
      timeout: 10000
    });
    
    if (response.data.itemList && response.data.itemList[0]) {
      const videoData = response.data.itemList[0];
      return this.parseVideoData(videoData);
    }
    
    throw new Error('Share API không có dữ liệu');
  }
  
  // Method 3: Web scraping simulation
  async fetchWebScraping(url) {
    // Simulate browser request to get HTML
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      },
      timeout: 10000
    });
    
    // Extract video data from HTML
    const html = response.data;
    
    // Try to find JSON data in HTML
    const jsonRegex = /window\[\'SIGI_STATE\'\]\s*=\s*(.+?);\s*window\[\'SIGI_RETRY\'\]/;
    const match = html.match(jsonRegex);
    
    if (match) {
      try {
        const jsonData = JSON.parse(match[1]);
        
        // Navigate through JSON to find video data
        const itemModule = jsonData.ItemModule;
        if (itemModule) {
          const videoKey = Object.keys(itemModule)[0];
          const videoData = itemModule[videoKey];
          return this.parseVideoData(videoData);
        }
      } catch (e) {
        console.log('JSON parse error:', e.message);
      }
    }
    
    // Alternative: Look for video URL in HTML
    const videoUrlRegex = /"playAddr":"([^"]+)"/;
    const videoMatch = html.match(videoUrlRegex);
    
    if (videoMatch) {
      const videoUrl = videoMatch[1].replace(/\\u0026/g, '&');
      return {
        url: videoUrl,
        title: 'TikTok Video',
        author: 'TikTok User'
      };
    }
    
    throw new Error('Không tìm thấy video trong HTML');
  }
  
  // Parse video data from different API responses
  parseVideoData(videoData) {
    console.log('📦 Parsing video data structure:', Object.keys(videoData));
    
    // Try different possible structures
    let videoUrl = null;
    let musicUrl = null;
    let title = '';
    let author = '';
    let duration = 0;
    let thumbnail = '';
    
    // Structure 1: Official API response
    if (videoData.video && videoData.video.play_addr && videoData.video.play_addr.url_list) {
      videoUrl = videoData.video.play_addr.url_list[0];
      if (videoData.video.cover && videoData.video.cover.url_list) {
        thumbnail = videoData.video.cover.url_list[0];
      }
      duration = videoData.video.duration / 1000; // Convert to seconds
    }
    
    // Structure 2: Share API response
    if (videoData.video && videoData.video.downloadAddr) {
      videoUrl = videoData.video.downloadAddr;
      thumbnail = videoData.video.cover;
      duration = videoData.video.duration;
    }
    
    // Structure 3: Web scraping response
    if (videoData.video && videoData.video.playAddr) {
      videoUrl = videoData.video.playAddr;
    }
    
    // Get music URL
    if (videoData.music && videoData.music.playUrl) {
      musicUrl = videoData.music.playUrl;
    }
    
    // Get title/description
    if (videoData.desc) {
      title = videoData.desc.substring(0, 100);
    }
    
    // Get author
    if (videoData.author) {
      author = videoData.author.nickname || videoData.author.uniqueId || 'Unknown';
    }
    
    // If no video URL found in structures, try direct access
    if (!videoUrl) {
      // Try to find any video URL in the data
      const jsonString = JSON.stringify(videoData);
      const urlRegex = /https?:\/\/[^"\s]+\.(mp4|mov|avi|webm)/g;
      const urls = jsonString.match(urlRegex);
      
      if (urls && urls.length > 0) {
        videoUrl = urls[0];
      }
    }
    
    if (!videoUrl) {
      throw new Error('Không tìm thấy URL video');
    }
    
    // Clean up URL
    videoUrl = videoUrl.replace(/\\\//g, '/').replace(/\\u0026/g, '&');
    
    return {
      url: videoUrl,
      music: musicUrl,
      title: title || 'TikTok Video',
      author: author || 'TikTok Creator',
      duration: duration,
      thumbnail: thumbnail
    };
  }
  
  // Extract video ID from various TikTok URL formats
  extractVideoId(url) {
    console.log('🔗 Extracting from URL:', url);
    
    // Remove query parameters
    const cleanUrl = url.split('?')[0];
    
    // Pattern 1: /video/1234567890123456789
    const pattern1 = /\/video\/(\d+)/;
    // Pattern 2: /v/1234567890123456789
    const pattern2 = /\/v\/(\d+)/;
    // Pattern 3: @username/video/1234567890123456789
    const pattern3 = /@[^/]+\/video\/(\d+)/;
    // Pattern 4: vt.tiktok.com/XXXXXXX/
    const pattern4 = /vt\.tiktok\.com\/([A-Za-z0-9]+)/;
    
    let match = cleanUrl.match(pattern1) || 
                cleanUrl.match(pattern2) || 
                cleanUrl.match(pattern3);
    
    if (match) {
      return match[1];
    }
    
    // For vt.tiktok.com links, we need to resolve the redirect
    if (pattern4.test(cleanUrl)) {
      return this.resolveShortUrl(cleanUrl);
    }
    
    // Try to find any numeric ID in the URL
    const numericMatch = cleanUrl.match(/\/(\d{5,})/);
    if (numericMatch) {
      return numericMatch[1];
    }
    
    return null;
  }
  
  async resolveShortUrl(shortUrl) {
    try {
      const response = await axios.get(shortUrl, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 300 && status < 400;
        },
        timeout: 5000
      });
      
      const location = response.headers.location;
      if (location) {
        return this.extractVideoId(location);
      }
    } catch (error) {
      console.log('Short URL resolve failed:', error.message);
    }
    
    return null;
  }
  
  // Generate fake device IDs and signatures
  generateIID() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  generateDeviceId() {
    return '7' + Math.random().toString(9).substring(2, 17);
  }
  
  generateOpenUDID() {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
  }
  
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  generateFingerprint() {
    const randomString = Math.random().toString(36).substring(2, 15);
    return crypto.createHash('md5').update(randomString).digest('hex');
  }
  
  generateGorgon(params, userAgent) {
    // Simplified Gorgon generation (real one is more complex)
    const timestamp = Math.floor(Date.now() / 1000);
    const randomStr = Math.random().toString(36).substring(7);
    const data = `${timestamp}${userAgent}${JSON.stringify(params)}${randomStr}`;
    return crypto.createHash('md5').update(data).digest('hex').substring(0, 8);
  }
  
  // Validate TikTok URL
  isValidTikTokUrl(url) {
    if (!url) return false;
    
    const patterns = [
      /tiktok\.com\/@[^/]+\/video\/\d+/,
      /tiktok\.com\/video\/\d+/,
      /tiktok\.com\/v\/\d+/,
      /vt\.tiktok\.com\/[A-Za-z0-9]+/,
      /vm\.tiktok\.com\/[A-Za-z0-9]+/,
      /tiktok\.com\/t\/[A-Za-z0-9]+/
    ];
    
    return patterns.some(pattern => pattern.test(url));
  }
}

module.exports = new TikTokService();
