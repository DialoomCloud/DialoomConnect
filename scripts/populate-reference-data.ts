import { readFileSync } from 'fs';
import { db } from '../server/db';
import { countries, languages, skills, categories } from '../shared/schema';

function parseCSV(filePath: string): any[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      let value = values[index] || '';
      
      // Convert numeric strings to numbers
      if (!isNaN(Number(value)) && value !== '') {
        row[header] = Number(value);
      } else if (value.toLowerCase() === 'true') {
        row[header] = true;
      } else if (value.toLowerCase() === 'false') {
        row[header] = false;
      } else {
        row[header] = value;
      }
    });
    
    return row;
  });
}

async function populateData() {
  try {
    console.log('Poblando datos de referencia...');

    // Clear existing data
    await db.delete(countries);
    await db.delete(languages);
    await db.delete(skills);
    await db.delete(categories);

    // Load and insert countries
    const countriesData = parseCSV('./attached_assets/countries_export_1753874817394.csv');
    console.log('Países a insertar:', countriesData.length);
    await db.insert(countries).values(countriesData);

    // Load and insert languages
    const languagesData = parseCSV('./attached_assets/languages_export_1753874817395.csv');
    console.log('Idiomas a insertar:', languagesData.length);
    await db.insert(languages).values(languagesData);

    // Load and insert skills
    const skillsData = parseCSV('./attached_assets/skills_export_1753874817395.csv');
    console.log('Habilidades a insertar:', skillsData.length);
    await db.insert(skills).values(skillsData);

    // Load and insert categories
    const categoriesData = parseCSV('./attached_assets/categories_export_1753874817396.csv');
    console.log('Categorías a insertar:', categoriesData.length);
    await db.insert(categories).values(categoriesData);

    console.log('✅ Datos de referencia poblados exitosamente!');
  } catch (error) {
    console.error('❌ Error poblando datos:', error);
  } finally {
    process.exit();
  }
}

populateData();