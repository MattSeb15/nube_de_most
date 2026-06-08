const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const id = 'fe849210-bf8d-429e-a7f3-7dcee0e6898b'; // from screenshot
  const { data, error } = await supabase
    .from("archivos_apuntes")
    .select(`
      *,
      perfiles!creador_id(nombre_completo, avatar_url, rol),
      carpetas_apuntes(id, materia_id, materias(id, nombre, semestre_id, codigo))
    `)
    .eq("id", id)
    .single();
    
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
