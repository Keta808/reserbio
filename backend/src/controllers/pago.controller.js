/* eslint-disable quotes */
/* eslint-disable require-jsdoc */
export const pagoExitoso = (req, res) => {
    res.status(200).json({ message: 'Pago completado con éxito.' });
  };
  
  export const pagoFallido = (req, res) => {
    res.status(400).json({ message: 'Pago fallido.' });
  };
