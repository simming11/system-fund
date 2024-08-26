import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_Backend}/api`;

class ApiServiceLocations {

  static async getLocations() {
    return axios.get(`${API_URL}/locations`);
  }

  static async getSouthernLocations() {
    return axios.get(`${API_URL}/southern-locations`);
  }

  // แก้ไขฟังก์ชัน getDistricts ให้รับ provinceName แทน provinceId
  static async getDistricts(provinceName: string) {
    return axios.get(`${API_URL}/districts/${provinceName}`);
  }

  static async getSubdistricts(districtName: string) {  // แก้ไขให้รับ districtName แทน districtId
    return axios.get(`${API_URL}/subdistricts/${districtName}`);
  }
}

export default ApiServiceLocations;
