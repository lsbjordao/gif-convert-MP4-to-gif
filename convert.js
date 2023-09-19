const { exec } = require('child_process');
const ProgressBar = require('progress');
const path = require('path'); // Importe o módulo path

// Caminho para o vídeo MP4 de entrada
const inputVideoPath = path.join(__dirname, 'input', 'video.mp4'); // Caminho completo para o vídeo

// Caminho para o arquivo GIF de saída
const outputGIFPath = path.join(__dirname, 'output', 'image.gif');

// Comando FFmpeg para converter o vídeo para GIF com loop 1
const ffmpegCommand = `ffmpeg -y -i "${inputVideoPath}" -loop 1 "${outputGIFPath}"`;

// Configurar a barra de progresso
const progressBar = new ProgressBar('Conversão em andamento [:bar] :percent :etas', {
  total: 100, // Total de porcentagem a ser atingida
  width: 50,  // Largura da barra de progresso
});

const process1 = exec(ffmpegCommand);

// Acompanhar a saída padrão para capturar o progresso do FFmpeg
process1.stdout.on('data', (data) => {
  const progressMatch = data.toString().match(/(\d+(\.\d+)?)/);
  if (progressMatch && progressMatch[1]) {
    const progress = parseFloat(progressMatch[1]);
    progressBar.update(progress / 100);
  }
});

process1.stderr.on('data', (data) => {
  console.error(data.toString());
});

process1.on('close', (code) => {
  if (code === 0) {
    console.log('\nConversão FFmpeg concluída. O arquivo GIF foi salvo em:', outputGIFPath);

    // Comando Gifsicle para ajustar o número de loops
    const gifsicleCommand = `"C:/gifsicle-1.94/gifsicle" "${outputGIFPath}" --no-loopcount"`;

    // Iniciar o processo Gifsicle
    const process2 = exec(gifsicleCommand);

    process2.on('close', (gifsicleCode) => {
      if (gifsicleCode === 0) {
        console.log('Ajuste de loops com Gifsicle concluído.');
      } else {
        console.error('Erro durante o ajuste de loops com Gifsicle. Código de saída:', gifsicleCode);
      }
    });
  } else {
    console.error('Erro durante a conversão FFmpeg. Código de saída:', code);
  }
});
