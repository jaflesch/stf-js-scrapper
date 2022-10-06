enum MapProvinceToGeChartCode {
  "AC - ACRE" = 'BR-AC',
  "PA - PARÁ" = 'BR-PA',
  "AP - AMAPÁ"  = 'BR-AP',
  "BA - BAHIA"  = 'BR-BA',
  "CE - CEARÁ"  = 'BR-CE',
  "GO - GOIÁS"  = 'BR-GO',
  "PR - PARANÁ" = 'BR-PR',
  "PI - PIAUÍ"  = 'BR-PI',
  "AM - AMAZONAS" = 'BR-AM',
  "AL - ALAGOAS"  = 'BR-AL',
  "PB - PARAÍBA"  = 'BR-PB',
  "MA - MARANHÃO" = 'BR-MA',
  "RO - RONDÔNIA" = 'BR-RO',
  "RR - RORAIMA"  = 'BR-RR',
  "SE - SERGIPE"  = 'BR-SE',
  "SP - SÃO PAULO"  = 'BR-SP',
  "PE - PERNAMBUCO" = 'BR-PE',
  "TO - TOCANTINS"  = 'BR-TO',
  "MG - MINAS GERAIS" = 'BR-MG',
  "MT - MATO GROSSO"  = 'BR-MT',
  "ES - ESPÍRITO SANTO" = 'BR-ES',
  "SC - SANTA CATARINA" = 'BR-SC',
  "RJ - RIO DE JANEIRO" = 'BR-RJ',
  "DF - DISTRITO FEDERAL" = 'BR-DF',
  "RS - RIO GRANDE DO SUL"  = 'BR-RS',
  "MS - MATO GROSSO DO SUL" = 'BR-MS',
  "RN - RIO GRANDE DO NORTE"  = 'BR-RN',
}

enum MapCountryToChartCode {
  "IT - ITÁLIA"= 'Italy',
  "RFA - REPÚBLICA FEDERAL DA ALEMANHA"= 'Germany',
  "EU - ESTADOS UNIDOS DA AMÉRICA"= 'United States',
  "EU - ESTADOS UNIDOS DA AMERICA"= 'United States',
  "PT - PORTUGAL"= 'Portugal',
  "AT - ARGENTINA"= 'Argentina',
  "REPÚBLICA PORTUGUESA"= 'Portugal',
  "FR - FRANÇA"= 'France',
  "REPÚBLICA ITALIANA"= 'Italy',
  "UR - URUGUAI"= 'Uruguay',
  "ESTADOS UNIDOS DA AMÉRICA"= 'United States',
  "RFA - REPUBLICA FEDERAL DA ALEMANHA"= 'Germany',
  "REPÚBLICA FEDERAL DA ALEMANHA"= 'Germany',
  "ME - MÉXICO"= 'Mexico',
  "EP - ESPANHA"= 'Spain',
  "SI - SUÍÇA"= 'Switzerland',
  "PG - PARAGUAI"= 'Paraguay',
  "REPÚBLICA ORIENTAL DO URUGUAI"= 'Uruguay',
  "REPÚBLICA ARGENTINA"= 'Argentina',
  "REPÚBLICA FRANCESA"= 'France',
  "PU - PERU"= 'Peru',
  "CD - CANADÁ"= 'Canada',
  "PT - REPÚBLICA PORTUGUESA"= 'Portugal',
  "REPÚBLICA TCHECA"= 'Czech Republic',
  "CONFEDERAÇÃO HELVÉTICA"= 'Switzerland',
  "HL - HOLANDA"= 'Netherlands',
  "UK - REINO UNIDO DA GRA-BRETANHA E DA IRLANDA DO NORTE"= 'United Kingdom',
  "ME - MEXICO"= 'Mexico',
  "DI - DINAMARCA"= 'Denmark',
  "REPÚBLICA DO CHILE"= 'Chile',
  "AT- ARGENTINA"= 'Argentina',
  "URU - REPÚBLICA ORIENTAL DO URUGUAI"= 'Uruguay',
  "BE - BÉLGICA"= 'Belgium',
  "SI - SUIÇA"= 'Switzerland',
  "CL - CHILE"= 'Chile',
  "GR - GRÉCIA"= 'Greece',
  "REPÚBLICA DA CORÉIA"= 'South Korea',
  "REPÚBLICA DA HUNGRIA"= 'Hungary',
  "NO - REINO DA NORUEGA"= 'Norway',
  "DI - REINO DA DINAMARCA"= 'Denmark',
  "FR - FRANCA"= 'France',
  "IN - GRA BRETANHA (INGLATERRA)"= '',
  "REINO DA ESPANHA"= 'Spain',
  "AU - ÁUSTRIA"= 'Austria',
  "PT- PORTUGAL"= 'Portugal',
  "BO - BOLÍVIA"= 'Bolivia',
  "EUA - ESTADOS UNIDOS DA AMÉRICA"= 'United States',
}

export const getGeoChartBRCode = (brProvince: keyof typeof MapProvinceToGeChartCode) => {
  return MapProvinceToGeChartCode[brProvince] || '';
}

export const getGeoChartCountryCode = (countryCode: keyof typeof MapCountryToChartCode) => {
  return MapCountryToChartCode[countryCode] || '';
}

export const getGeoChartBRLabel = (brProvince: string) => {
  const values = brProvince.split(' - ');
  return values.length === 2 ? values[1] : values[0];
}
