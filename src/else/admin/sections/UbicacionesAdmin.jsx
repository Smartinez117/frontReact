import * as React from "react";
import Table from "@mui/joy/Table";
import { CssVarsProvider } from "@mui/joy/styles";
import JoyCssBaseline from "@mui/joy/CssBaseline";

export default function UbicacionesAdmin() {
  return (
    <CssVarsProvider>
      <JoyCssBaseline />
      <Table aria-label="basic table">
        <thead>
          <tr>
            <th style={{ width: "40%" }}>Localidad</th>
            <th>Partido</th>
            <th>Provincia</th>
            <th>Latitud</th>
            <th>Longitud</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Garin</td>
            <td>Escobar</td>
            <td>Buenos Aires</td>
            <td>24</td>
            <td>4</td>
          </tr>
          <tr>
            <td>General Pacheco</td>
            <td>Tigre</td>
            <td>Buenos Aires</td>
            <td>37</td>
            <td>4.3</td>
          </tr>
          <tr>
            <td>Cardales</td>
            <td>Campana</td>
            <td>Buenos Aires</td>
            <td>24</td>
            <td>6</td>
          </tr>
          <tr>
            <td>Palermo</td>
            <td>Comuna 14</td>
            <td>Ciudad autónoma de Buenos Aires</td>
            <td>67</td>
            <td>4.3</td>
          </tr>
          <tr>
            <td>Gingerbread</td>
            <td>356</td>
            <td>16</td>
            <td>49</td>
            <td>3.9</td>
          </tr>
        </tbody>
      </Table>
    </CssVarsProvider>
  );
}
