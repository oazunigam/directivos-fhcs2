'use client';
import { useMemo, useState } from 'react';

export default function DirectivosFHCS() {
  const [busqueda, setBusqueda] = useState('');
  const [directivoSeleccionado, setDirectivoSeleccionado] = useState<any>(null);
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroDependencia, setFiltroDependencia] = useState('Todas');
  const [directivoAEliminar, setDirectivoAEliminar] = useState<any>(null);

  const [directivos, setDirectivos] = useState<any[]>([]);

  const [nuevoDirectivo, setNuevoDirectivo] = useState({
    nombre: '',
    cargo: '',
    dependencia: '',
    inicio: '',
    fin: '',
  });

  const eliminarDirectivo = (id: number) => {
    setDirectivos(directivos.filter((d) => d.id !== id));

    if (directivoSeleccionado?.id === id) {
      setDirectivoSeleccionado(null);
    }

    setDirectivoAEliminar(null);
  };

  const calcularEstado = (fechaFin: string) => {
    const hoy = new Date();
    const fin = new Date(fechaFin);

    return fin >= hoy ? 'Activo' : 'Finalizado';
  };

  const agregarDirectivo = () => {
    if (
      !nuevoDirectivo.nombre ||
      !nuevoDirectivo.cargo ||
      !nuevoDirectivo.dependencia
    ) {
      alert('Completa todos los campos');
      return;
    }

    const estadoCalculado = calcularEstado(nuevoDirectivo.fin);

    const inicioDate = new Date(nuevoDirectivo.inicio);
    const finDate = new Date(nuevoDirectivo.fin);

    const diferenciaAnios = Math.max(
      1,
      finDate.getFullYear() - inicioDate.getFullYear()
    );

    const directivoExistente = directivos.find(
      (d) =>
        d.nombre === nuevoDirectivo.nombre &&
        d.cargo === nuevoDirectivo.cargo &&
        d.dependencia === nuevoDirectivo.dependencia
    );

    if (directivoExistente) {
      const historialActualizado = [
        ...directivoExistente.historial,
        {
          inicio: nuevoDirectivo.inicio,
          fin: nuevoDirectivo.fin,
          estado: estadoCalculado,
        },
      ];

      const periodosTotales = historialActualizado.length;

      const tiempoTotal = historialActualizado.reduce((acc, periodo) => {
        const inicio = new Date(periodo.inicio).getFullYear();
        const fin = new Date(periodo.fin).getFullYear();

        return acc + Math.max(1, fin - inicio);
      }, 0);

      const ultimoPeriodo =
        historialActualizado[historialActualizado.length - 1];

      const estadoGeneral = historialActualizado.some(
        (p) => p.estado === 'Activo'
      )
        ? 'Activo'
        : 'Finalizado';

      const directivosActualizados = directivos.map((d) => {
        if (d.id !== directivoExistente.id) return d;

        return {
          ...d,
          historial: historialActualizado,
          periodos: periodosTotales,
          tiempo: `${tiempoTotal} año${tiempoTotal > 1 ? 's' : ''}`,
          vigencia: `${ultimoPeriodo.inicio} - ${ultimoPeriodo.fin}`,
          estado: estadoGeneral,
        };
      });

      setDirectivos(directivosActualizados);
    } else {
      const nuevoRegistro = {
        id: Date.now(),
        nombre: nuevoDirectivo.nombre,
        cargo: nuevoDirectivo.cargo,
        dependencia: nuevoDirectivo.dependencia,
        estado: estadoCalculado,
        periodos: 1,
        vigencia: `${nuevoDirectivo.inicio} - ${nuevoDirectivo.fin}`,
        tiempo: `${diferenciaAnios} año${diferenciaAnios > 1 ? 's' : ''}`,
        historial: [
          {
            inicio: nuevoDirectivo.inicio,
            fin: nuevoDirectivo.fin,
            estado: estadoCalculado,
          },
        ],
      };

      setDirectivos([nuevoRegistro, ...directivos]);
    }

    setNuevoDirectivo({
      nombre: '',
      cargo: '',
      dependencia: '',
      inicio: '',
      fin: '',
    });
  };

  const estadisticas = useMemo(() => {
    const activos = directivos.filter((d) => d.estado === 'Activo').length;

    const proximos = directivos.filter((d) => {
      const ultimo = d.historial[d.historial.length - 1];

      if (!ultimo?.fin) return false;

      const actual = new Date().getFullYear();
      return Number(ultimo.fin) <= actual + 1;
    }).length;

    const dependencias = new Set(directivos.map((d) => d.dependencia)).size;

    const renovaciones = directivos.filter((d) => d.periodos > 1).length;

    return {
      activos,
      proximos,
      dependencias,
      renovaciones,
    };
  }, [directivos]);

  const nombresRegistrados = [...new Set(directivos.map((d) => d.nombre))];

  const dependenciasRegistradas = [
    ...new Set(directivos.map((d) => d.dependencia)),
  ];

  const directivosFiltrados = directivos.filter((d) => {
    const texto = `${d.nombre} ${d.cargo} ${d.dependencia}`.toLowerCase();

    const coincideBusqueda = texto.includes(busqueda.toLowerCase());

    const coincideEstado =
      filtroEstado === 'Todos' || d.estado === filtroEstado;

    const coincideDependencia =
      filtroDependencia === 'Todas' || d.dependencia === filtroDependencia;

    return coincideBusqueda && coincideEstado && coincideDependencia;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* HEADER */}
      <header className="bg-slate-900 text-white px-8 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col gap-2">
          <h1 className="text-3xl font-bold">
            Sistema de Directivos Académicos FHCS
          </h1>
          <p className="text-slate-300 text-sm md:text-base">
            Facultad de Humanidades y Ciencias Sociales
          </p>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* PANEL MANUAL */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Registro manual de directivos
              </h2>

              <p className="text-slate-500 mt-1">
                Agrega información manualmente para alimentar y probar el
                sistema.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Nombre completo"
              value={nuevoDirectivo.nombre}
              onChange={(e) =>
                setNuevoDirectivo({
                  ...nuevoDirectivo,
                  nombre: e.target.value,
                })
              }
              className="px-4 py-3 rounded-xl border border-slate-300"
            />

            <select
              value={nuevoDirectivo.cargo}
              onChange={(e) =>
                setNuevoDirectivo({
                  ...nuevoDirectivo,
                  cargo: e.target.value,
                })
              }
              className="px-4 py-3 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">Selecciona cargo</option>
              <option value="Director">Director</option>
              <option value="Directora">Directora</option>
            </select>

            <select
              value={nuevoDirectivo.dependencia}
              onChange={(e) =>
                setNuevoDirectivo({
                  ...nuevoDirectivo,
                  dependencia: e.target.value,
                })
              }
              className="px-4 py-3 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">Dependencia / Programa</option>

              <optgroup label="Pregrados">
                <option value="Ciencia Política">Ciencia Política</option>
                <option value="Filosofía">Filosofía</option>
                <option value="Producción Audiovisual Interactiva">
                  Producción Audiovisual Interactiva
                </option>
                <option value="Comunicación">Comunicación</option>
                <option value="Psicología">Psicología</option>
                <option value="Derecho">Derecho</option>
              </optgroup>

              <optgroup label="Especializaciones">
                <option value="Cultura de Paz y Derecho Internacional Humanitario">
                  Cultura de Paz y Derecho Internacional Humanitario
                </option>
                <option value="Derecho Ambiental">Derecho Ambiental</option>
                <option value="Derecho Comercial">Derecho Comercial</option>
                <option value="Jurisdicción Agraria y Derecho de Tierras">
                  Jurisdicción Agraria y Derecho de Tierras
                </option>
                <option value="Neuropsicología Infantil">
                  Neuropsicología Infantil
                </option>
                <option value="Procesos Humanos y Desarrollo Organizacional">
                  Procesos Humanos y Desarrollo Organizacional
                </option>
                <option value="Seguridad Social">Seguridad Social</option>
              </optgroup>

              <optgroup label="Maestrías">
                <option value="Asesoría Familiar - Virtual">
                  Asesoría Familiar - Virtual
                </option>
                <option value="Comunicación y Creación Interactiva - Virtual">
                  Comunicación y Creación Interactiva - Virtual
                </option>
                <option value="Derecho Empresarial">Derecho Empresarial</option>
                <option value="Derechos Humanos y Cultura de Paz">
                  Derechos Humanos y Cultura de Paz
                </option>
                <option value="Educación">Educación</option>
                <option value="Neuropsicología Clínica">
                  Neuropsicología Clínica
                </option>
                <option value="Psicología de la Salud">
                  Psicología de la Salud
                </option>
              </optgroup>

              <optgroup label="Doctorado">
                <option value="Psicología">Psicología</option>
              </optgroup>
            </select>

            <input
              type="date"
              placeholder="Inicio"
              value={nuevoDirectivo.inicio}
              onChange={(e) =>
                setNuevoDirectivo({
                  ...nuevoDirectivo,
                  inicio: e.target.value,
                })
              }
              className="px-4 py-3 rounded-xl border border-slate-300"
            />

            <input
              type="date"
              placeholder="Fin"
              value={nuevoDirectivo.fin}
              onChange={(e) =>
                setNuevoDirectivo({
                  ...nuevoDirectivo,
                  fin: e.target.value,
                })
              }
              className="px-4 py-3 rounded-xl border border-slate-300"
            />
          </div>

          <button
            onClick={agregarDirectivo}
            className="mt-6 bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-slate-700 transition"
          >
            Agregar directivo
          </button>
        </section>
        {/* DASHBOARD */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200">
            <p className="text-sm text-slate-500">Directivos activos</p>
            <h2 className="text-3xl font-bold mt-2">{estadisticas.activos}</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200">
            <p className="text-sm text-slate-500">Próximos a vencer</p>
            <h2 className="text-3xl font-bold mt-2 text-orange-500">
              {estadisticas.proximos}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200">
            <p className="text-sm text-slate-500">Dependencias</p>
            <h2 className="text-3xl font-bold mt-2">
              {estadisticas.dependencias}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200">
            <p className="text-sm text-slate-500">Renovaciones recientes</p>
            <h2 className="text-3xl font-bold mt-2 text-green-600">
              {estadisticas.renovaciones}
            </h2>
          </div>
        </section>

        {/* FILTROS */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, cargo o dependencia..."
                list="directivos-lista"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-700"
              />

              <datalist id="directivos-lista">
                {nombresRegistrados.map((nombre, index) => (
                  <option key={index} value={nombre} />
                ))}
              </datalist>
            </div>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-300"
            >
              <option value="Todos">Todos los estados</option>
              <option>Activo</option>
              <option>Finalizado</option>
            </select>

            <select
              value={filtroDependencia}
              onChange={(e) => setFiltroDependencia(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-300"
            >
              <option value="Todas">Todas las dependencias</option>

              {dependenciasRegistradas.map((dependencia, index) => (
                <option key={index} value={dependencia}>
                  {dependencia}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* LISTADO */}
        <section>
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-200">
              {directivosFiltrados.map((directivo) => (
                <div
                  key={directivo.id}
                  className="hover:bg-slate-50 transition"
                >
                  <div className="px-6 py-5">
                    <div className="flex items-center justify-between gap-8 w-full">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-slate-900 truncate">
                          {directivo.nombre}
                        </h2>

                        <p className="text-slate-600 mt-1">{directivo.cargo}</p>

                        <p className="text-slate-500 mt-1 truncate">
                          {directivo.dependencia}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Estado
                        </p>

                        <span
                          className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            directivo.estado === 'Activo'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {directivo.estado}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Vigencia
                        </p>

                        <p className="font-medium text-slate-800 mt-2 whitespace-nowrap">
                          {directivo.vigencia}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Períodos
                        </p>

                        <p className="font-semibold text-slate-900 mt-2 text-lg">
                          {directivo.periodos}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Tiempo acumulado
                        </p>

                        <p className="font-medium text-slate-800 mt-2 whitespace-nowrap">
                          {directivo.tiempo}
                        </p>
                      </div>

                      <div className="flex justify-end shrink-0">
                        <button
                          onClick={() => setDirectivoSeleccionado(directivo)}
                          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-700 transition text-sm font-medium"
                        >
                          Ver detalle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MODAL DETALLE */}
        {directivoAEliminar && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 text-2xl font-bold">
                  !
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Confirmar eliminación
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8">
                <p className="font-semibold text-slate-900 text-lg">
                  {directivoAEliminar.nombre}
                </p>

                <p className="text-slate-500 mt-2">
                  {directivoAEliminar.cargo}
                </p>

                <p className="text-slate-500">
                  {directivoAEliminar.dependencia}
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDirectivoAEliminar(null)}
                  className="px-5 py-3 rounded-2xl border border-slate-300 hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => eliminarDirectivo(directivoAEliminar.id)}
                  className="bg-red-600 text-white px-5 py-3 rounded-2xl hover:bg-red-700 transition font-medium"
                >
                  Sí, eliminar definitivamente
                </button>
              </div>
            </div>
          </div>
        )}

        {directivoSeleccionado && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              <div className="bg-slate-900 text-white px-8 py-6">
                <div>
                  <h2 className="text-3xl font-bold">
                    {directivoSeleccionado.nombre}
                  </h2>

                  <p className="text-slate-300 mt-2 text-lg">
                    {directivoSeleccionado.cargo}
                  </p>

                  <p className="text-slate-400 mt-1">
                    {directivoSeleccionado.dependencia}
                  </p>
                </div>
              </div>

              <div className="p-8 bg-slate-50 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-2xl p-5 border border-slate-200">
                    <p className="text-sm text-slate-500">Estado actual</p>
                    <h3 className="text-2xl font-bold mt-2 text-green-600">
                      {directivoSeleccionado.estado}
                    </h3>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-slate-200">
                    <p className="text-sm text-slate-500">Total períodos</p>
                    <h3 className="text-2xl font-bold mt-2">
                      {directivoSeleccionado.periodos}
                    </h3>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-slate-200">
                    <p className="text-sm text-slate-500">Tiempo acumulado</p>
                    <h3 className="text-2xl font-bold mt-2">
                      {directivoSeleccionado.tiempo}
                    </h3>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-slate-200">
                    <p className="text-sm text-slate-500">Vigencia actual</p>

                    <div className="mt-3 space-y-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Inicio
                        </p>

                        <p className="text-lg font-bold text-slate-900 mt-1">
                          {
                            directivoSeleccionado.historial[
                              directivoSeleccionado.historial.length - 1
                            ]?.inicio
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Finalización
                        </p>

                        <p className="text-lg font-bold text-slate-900 mt-1">
                          {
                            directivoSeleccionado.historial[
                              directivoSeleccionado.historial.length - 1
                            ]?.fin
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 mb-8">
                  <h3 className="text-2xl font-bold mb-6 text-slate-900">
                    Historial detallado
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 text-left">
                          <th className="pb-4">Período</th>
                          <th className="pb-4">Inicio</th>
                          <th className="pb-4">Fin</th>
                          <th className="pb-4">Duración</th>
                          <th className="pb-4">Estado</th>
                        </tr>
                      </thead>

                      <tbody>
                        {directivoSeleccionado.historial.map(
                          (periodo, index) => (
                            <tr
                              key={index}
                              className="border-b border-slate-100"
                            >
                              <td className="py-5 font-semibold">
                                Período {index + 1}
                              </td>

                              <td className="py-5">
                                {new Date(periodo.inicio).toLocaleDateString(
                                  'es-CO',
                                  {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  }
                                )}
                              </td>

                              <td className="py-5">
                                {new Date(periodo.fin).toLocaleDateString(
                                  'es-CO',
                                  {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  }
                                )}
                              </td>

                              <td className="py-5 font-medium">
                                {Math.max(
                                  1,
                                  new Date(periodo.fin).getFullYear() -
                                    new Date(periodo.inicio).getFullYear()
                                )}{' '}
                                año
                                {Math.max(
                                  1,
                                  new Date(periodo.fin).getFullYear() -
                                    new Date(periodo.inicio).getFullYear()
                                ) > 1
                                  ? 's'
                                  : ''}
                              </td>

                              <td className="py-5">
                                <span
                                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                                    periodo.estado === 'Activo'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {periodo.estado}
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6">
                  <h3 className="text-2xl font-bold mb-6 text-slate-900">
                    Timeline institucional
                  </h3>

                  <div className="space-y-6">
                    {directivoSeleccionado.historial.map((periodo, index) => (
                      <div key={index} className="flex gap-5 items-start">
                        <div className="flex flex-col items-center">
                          <div className="w-5 h-5 rounded-full bg-slate-900"></div>

                          {index !==
                            directivoSeleccionado.historial.length - 1 && (
                            <div className="w-1 h-16 bg-slate-300"></div>
                          )}
                        </div>

                        <div className="pb-8">
                          <p className="text-xl font-bold text-slate-900">
                            {new Date(periodo.inicio).toLocaleDateString(
                              'es-CO',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              }
                            )}{' '}
                            —{' '}
                            {new Date(periodo.fin).toLocaleDateString('es-CO', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>

                          <p className="text-slate-500 mt-2">
                            {index === 0
                              ? 'Primer período institucional'
                              : `Renovación / Período ${index + 1}`}
                          </p>

                          <div className="mt-3">
                            <span
                              className={`px-4 py-2 rounded-full text-sm font-medium ${
                                periodo.estado === 'Activo'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {periodo.estado}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setDirectivoAEliminar(directivoSeleccionado);
                      setDirectivoSeleccionado(null);
                    }}
                    className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-2xl transition text-white font-medium"
                  >
                    Eliminar registro
                  </button>

                  <button
                    onClick={() => setDirectivoSeleccionado(null)}
                    className="bg-slate-900 hover:bg-slate-700 px-6 py-3 rounded-2xl transition text-white font-medium"
                  >
                    Cerrar ventana
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
