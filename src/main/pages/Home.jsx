import React from "react"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import CardActionArea from "@mui/material/CardActionArea"
import PostAddIcon from "@mui/icons-material/PostAdd"
import VisibilityIcon from "@mui/icons-material/Visibility"
import TravelExploreIcon from "@mui/icons-material/TravelExplore"
import { Link } from "react-router-dom"

const cards = [
  {
    id: 1,
    title: "Publicá",
    description: "Publica una búsqueda, encuentro, adopción o estado crítico",
    icon: <PostAddIcon fontSize="large" color="primary" />,
    url: "/publicar"
  },
  {
    id: 2,
    title: "Buscá",
    description: "Busca o filtra entre miles de publicaciones",
    icon: <VisibilityIcon fontSize="large" color="primary" />,
    url: "/buscar"
  },
  {
    id: 3,
    title: "Navegá",
    description: "Busca veterinarias, refugios y más!",
    icon: <TravelExploreIcon fontSize="large" color="primary" />,
    url: "/navegar"
  }
]

const Home = () => {
  const [selectedCard, setSelectedCard] = React.useState(null)

  return (
    <Box sx={{ padding: 4 }}>
      <Box
        sx={{
          width: "100%",
          marginTop: 3,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 2
        }}
      >
        {cards.map((card, index) => (
          <Card key={card.id}>
            <CardActionArea
              component={card.url ? Link : "div"}
              to={card.url}
              onClick={() => setSelectedCard(index)}
              data-active={selectedCard === index ? "" : undefined}
              sx={{
                height: "100%",
                "&[data-active]": {
                  backgroundColor: "action.selected",
                  "&:hover": {
                    backgroundColor: "action.selectedHover"
                  }
                }
              }}
            >
              <CardContent>
                {card.icon && (
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                    {card.icon}
                  </Box>
                )}
                <Typography variant="h5" component="div" align="center">
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {card.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

export default Home