package unisanta.br.StudIA.Model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "modulos")
public class Modulos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "module_id", nullable = false)
    private Integer moduleId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "completion_date", nullable = false)
    private LocalDate completionDate;

    @Column(name = "score", nullable = false)
    private Integer score;

    // Construtores
    public Modulos() {}

    public Modulos(Long userId, Integer moduleId, String title, LocalDate completionDate, Integer score) {
        this.userId = userId;
        this.moduleId = moduleId;
        this.title = title;
        this.completionDate = completionDate;
        this.score = score;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getModuleId() { return moduleId; }
    public void setModuleId(Integer moduleId) { this.moduleId = moduleId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDate getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDate completionDate) { this.completionDate = completionDate; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
}